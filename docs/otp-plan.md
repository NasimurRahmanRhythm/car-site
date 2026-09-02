# Admin Login: Magic Link → OTP

**Status:** পরে করা হবে। Blocker নেই — শুধু Resend/SMTP-এর অংশটা domain কেনার পর।
**তারিখ:** 2026-08-30

---

## এক লাইনে

কোড already ৯০% তৈরি। `src/lib/services/auth.service.ts` এর `sendMagicLink()` আসলে
`supabase.auth.signInWithOtp()` কল করে — Supabase-এ magic link আর 6-digit OTP **একই API**।
প্রতিবার Supabase দুটোই generate করে; user লিংক পাবে নাকি কোড পাবে সেটা পুরোপুরি
**email template** ঠিক করে।

তাই বড় কাজটা dashboard-এ, কোডে শুধু একটা verify step যোগ করতে হবে।

---

## Part A — Supabase Dashboard (কোড লাগে না)

1. **Authentication → Emails → Templates → "Magic Link"**
   template-এ `{{ .ConfirmationURL }}` এর জায়গায় `{{ .Token }}` বসাতে হবে।
   এতেই email-এ লিংকের বদলে ৬ ডিজিটের কোড যাবে।

2. **একই কাজ "Confirm signup" template-এও করতে হবে।**
   নতুন কোনো admin email প্রথমবার login করলে Supabase magic link template নয়,
   signup template পাঠায়।

3. **Authentication → Sign In / Providers → Email**
   - `Email OTP Expiration` — default 3600s, **600s (১০ মিনিট)** suggest করা হচ্ছে
   - `Email OTP Length` — 6

4. **SMTP (Resend) — এইটার জন্যই কাজটা পিছিয়েছে**
   Supabase-এর built-in SMTP-তে ঘণ্টায় ২-৩টা email-এর limit। OTP-তে মানুষ retry
   বেশি করে, তাই rate limit-এ আটকানোর সম্ভাবনা magic link-এর চেয়ে বেশি।

   > **Domain ছাড়া interim option:** Resend-এর test sender `onboarding@resend.dev`
   > domain verify ছাড়াই কাজ করে, কিন্তু **শুধু Resend account-এর নিজের email-এ**
   > পাঠাতে পারে। Admin যেহেতু এখন একজনই (`rhythm4538@gmail.com`), সেই email দিয়ে
   > Resend account খুললে domain কেনার আগেই এটা দিয়ে চালানো যায়। আরও admin যোগ
   > করতে চাইলে তখন domain লাগবেই।

---

## Part B — কোড পরিবর্তন (৪টা ফাইল, ~১ ঘণ্টা)

### 1. `src/lib/services/auth.service.ts`

- `sendMagicLink()` → `sendLoginCode()` — body একই, শুধু `options.emailRedirectTo`
  বাদ (আর redirect লাগবে না)। `isEmailAllowed()` whitelist gate যেমন আছে তেমনই থাকবে।
- নতুন `verifyLoginCode(email, token)`:

  ```ts
  const { error } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token,
    type: "email",
  });
  ```

  verify হওয়ার **পরেও** whitelist re-check করতে হবে (defence in depth)।
  ভুল/expired কোডে friendly error return করবে, raw Supabase message নয়।

### 2. `src/app/actions/auth.ts`

- `loginAction` — success-এ `{ step: "code", email }` return করবে (শুধু `success: true` নয়),
  যাতে form দ্বিতীয় ধাপে যেতে পারে।
- নতুন `verifyCodeAction(prevState, formData)` — `verifyLoginCode()` কল করে,
  সফল হলে `redirect("/admin")`।
- `getOrigin()` helper আর লাগবে না (ওটা শুধু `emailRedirectTo`-এর জন্য ছিল)।

### 3. `src/components/admin/LoginForm/LoginForm.tsx`

Two-step UI:

- **Step 1** — email input (এখন যা আছে)
- **Step 2** — code input:
  `inputMode="numeric"`, `autoComplete="one-time-code"`, `maxLength={6}`,
  `pattern="[0-9]{6}"` — মোবাইলে numeric keypad আর iOS-এ autofill পাওয়ার জন্য
- "Resend code" আর "Change email" button
- `useActionState` pattern যেমন আছে তেমনই থাকবে

### 4. `src/app/auth/callback/route.ts`

Login flow-এ আর ব্যবহার হবে না। **এখনই delete করা উচিত না** — কারও inbox-এ পুরনো
লিংক থেকে গেলে সেটা ভাঙবে। কয়েক সপ্তাহ পরে সরানো যাবে।

### যেগুলোতে হাত দিতে হবে না

`src/proxy.ts`, `src/lib/supabase/middleware.ts`, RLS policy, `is_admin()` —
কিছুই বদলাবে না। `verifyOtp()` একই session cookie সেট করে, তাই guard-গুলো
আগের মতোই কাজ করবে।

---

## যেটা টেস্ট করে দেখতে হবে

`verifyOtp()` এর `type` — existing user-এর জন্য `"email"` কাজ করে। কিন্তু **একদম নতুন
admin email** (যার Supabase user এখনো তৈরি হয়নি) প্রথমবার login করলে GoTrue signup flow
ব্যবহার করে, তখন `type: "signup"` লাগতে পারে।

**সমাধান:** `"email"` দিয়ে try করে, fail করলে `"signup"`-এ fallback — দুটো case-ই cover
হয়ে যাবে।

---

## Verify checklist

- [ ] Whitelist-এ নেই এমন email → email-ই পাঠাবে না, "not registered" দেখাবে
- [ ] সঠিক কোড → `/admin`-এ যাবে
- [ ] ভুল কোড → error message, session তৈরি হবে না
- [ ] Expired কোড (১০ মিনিটের পর) → error
- [ ] নতুন admin email `admin_members`-এ যোগ করে প্রথম login (signup fallback টেস্ট)
- [ ] Sign out → আবার login

---

## Deploy করার ক্রম

কোড আর template change একসাথে করার দরকার নেই — কোড আগে deploy করলেও সমস্যা নেই।
Supabase তখন লিংক পাঠাবে **এবং** কোডটাও valid থাকবে, তাই দুটোই কাজ করবে।
Template বদলালে শুধু লিংকটা email থেকে চলে যাবে।
