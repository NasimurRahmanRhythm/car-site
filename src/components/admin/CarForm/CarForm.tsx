import { CATEGORIES, CAR_STATUS_LABELS } from "@/lib/constants";
import { DEFAULT_CURRENCY } from "@/lib/utils";
import type { CarWithImages } from "@/types/car";
import { FileDropzone } from "@/components/common/FileDropzone";
import { SubmitButton } from "@/components/common/SubmitButton";
import styles from "./CarForm.module.css";

interface CarFormProps {
  car?: CarWithImages;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}

export function CarForm({ car, action, submitLabel }: CarFormProps) {
  // On an existing car the photos live in <ImageUploader>, which can also
  // delete them and pick the cover — none of which is possible before the row
  // exists. So the new-vehicle form carries its own picker and hands the files
  // to createCarAction, which uploads them once the car has an id.
  const isNewCar = !car;

  // Fixed rather than typed: a free-text code once reached Intl.NumberFormat as
  // an invalid currency and took the page down. New cars are BDT; an existing
  // row keeps whatever it was saved with, shown but not editable.
  const currency = car?.currency ?? DEFAULT_CURRENCY;

  return (
    <form action={action} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Basics</legend>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="make">
            Make
          </label>
          <input
            id="make"
            name="make"
            type="text"
            required
            defaultValue={car?.make}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="model">
            Model
          </label>
          <input
            id="model"
            name="model"
            type="text"
            required
            defaultValue={car?.model}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="year">
            Year
          </label>
          <input
            id="year"
            name="year"
            type="number"
            required
            defaultValue={car?.year}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="trim">
            Trim
          </label>
          <input id="trim" name="trim" type="text" defaultValue={car?.trim ?? ""} className={styles.input} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="price">
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            defaultValue={car?.price}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="currency">
            Currency
          </label>
          <input
            id="currency"
            type="text"
            defaultValue={currency}
            disabled
            className={styles.input}
          />
          {/* A disabled field is left out of the submission, so the value that
              the action reads rides along here instead. */}
          <input type="hidden" name="currency" value={currency} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="status">
            Status
          </label>
          <select id="status" name="status" defaultValue={car?.status ?? "available"} className={styles.select}>
            {Object.entries(CAR_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.checkboxLabel}>
          <input
            id="is_featured"
            name="is_featured"
            type="checkbox"
            defaultChecked={car?.is_featured}
          />
          <label htmlFor="is_featured">Feature on homepage</label>
        </div>

        <div className={styles.checkboxRow}>
          {CATEGORIES.map((category) => (
            <label key={category.value} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="categories"
                value={category.value}
                defaultChecked={car?.categories.includes(category.value)}
              />
              {category.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Specifications</legend>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="mileage">
            Mileage (km)
          </label>
          <input id="mileage" name="mileage" type="number" defaultValue={car?.mileage ?? ""} className={styles.input} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="transmission">
            Transmission
          </label>
          <input
            id="transmission"
            name="transmission"
            type="text"
            defaultValue={car?.transmission ?? ""}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="fuel_type">
            Fuel Type
          </label>
          <input
            id="fuel_type"
            name="fuel_type"
            type="text"
            defaultValue={car?.fuel_type ?? ""}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="engine">
            Engine
          </label>
          <input id="engine" name="engine" type="text" defaultValue={car?.engine ?? ""} className={styles.input} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="horsepower">
            Horsepower
          </label>
          <input
            id="horsepower"
            name="horsepower"
            type="number"
            defaultValue={car?.horsepower ?? ""}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="drivetrain">
            Drivetrain
          </label>
          <input
            id="drivetrain"
            name="drivetrain"
            type="text"
            defaultValue={car?.drivetrain ?? ""}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="body_type">
            Body Type
          </label>
          <input
            id="body_type"
            name="body_type"
            type="text"
            defaultValue={car?.body_type ?? ""}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="doors">
            Doors
          </label>
          <input id="doors" name="doors" type="number" defaultValue={car?.doors ?? ""} className={styles.input} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="seats">
            Seats
          </label>
          <input id="seats" name="seats" type="number" defaultValue={car?.seats ?? ""} className={styles.input} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="exterior_color">
            Exterior Color
          </label>
          <input
            id="exterior_color"
            name="exterior_color"
            type="text"
            defaultValue={car?.exterior_color ?? ""}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="interior_color">
            Interior Color
          </label>
          <input
            id="interior_color"
            name="interior_color"
            type="text"
            defaultValue={car?.interior_color ?? ""}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="vin">
            VIN
          </label>
          <input id="vin" name="vin" type="text" defaultValue={car?.vin ?? ""} className={styles.input} />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Description &amp; Features</legend>

        <div className={`${styles.field} ${styles.wide}`}>
          <label className={styles.label} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={car?.description ?? ""}
            className={styles.textarea}
          />
        </div>

        <div className={`${styles.field} ${styles.wide}`}>
          <label className={styles.label} htmlFor="features">
            Features (one per line)
          </label>
          <textarea
            id="features"
            name="features"
            defaultValue={car?.features.join("\n") ?? ""}
            className={styles.textarea}
            placeholder={"Panoramic Sunroof\nCarbon Ceramic Brakes"}
          />
        </div>
      </fieldset>

      {isNewCar && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Photos</legend>

          <div className={`${styles.field} ${styles.wide}`}>
            <FileDropzone
              id="car-images"
              name="files"
              multiple
              label="Add photos"
              hint="JPG, PNG or WebP. The first photo becomes the cover. You can add more after saving."
            />
          </div>
        </fieldset>
      )}

      <div className={styles.footer}>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
