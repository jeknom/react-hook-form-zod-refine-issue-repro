import { useForm } from "react-hook-form";
import "./App.css";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  workingWithRefine: z
    .string()
    .refine(
      (value) => {
        if (value.length === 0) {
          return false
        }
        return value === "valid" || value === "invalid"
      },
      {
        message: 'Value has to be either "valid" or "invalid"',
      },
  ),
  notWorkingWithRefine: z
    .object({
      status: z.string(),
    })
    .refine(
      (value) => value.status === "valid" || value.status === "invalid",
      {
        message: 'Value has to be either "valid" or "invalid"'
      },
    ),
  alsoNotWorkingWithSuperRefine: z
    .object({
      status: z.string(),
    })
    .superRefine(({ status }, ctx) => {
      if (status !== "valid" && status !== "invalid") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Value has to be either "valid" or "invalid"',
        })
      }
    })
});

type FormSchema = z.infer<typeof formSchema>

const defaultValues: FormSchema = {
  workingWithRefine: 'this value is not allowed',
  notWorkingWithRefine: {
    status: 'this value is not allowed',
  },
  alsoNotWorkingWithSuperRefine: {
    status: 'this value is not allowed',
  },
}

function ErrorContainer({ title, error }: { title: string, error?: string }) {
  return (
    <div className='error-container'>
      <h2>{title}</h2>
      <p>{error ?? 'Error message is undefined'}</p>
    </div>
  )
}

function App() {
  const { register, handleSubmit, formState: { errors }} = useForm({ resolver: zodResolver(formSchema), defaultValues})  
  console.log(errors)
  return (
    <div className='stack'>
      <h1>React Hook Form Refine Error Repro</h1>
      <form className='stack' onSubmit={handleSubmit((data) => alert(`Submitted: ${JSON.stringify(data)}`))}>
        <label title='Working with refine'>
          <input {...register('workingWithRefine')} />
        </label>
        <label title='Not working with refine'>
          <input {...register('notWorkingWithRefine.status')} />
        </label>
        <label title='Also not working with superRefine'>
          <input {...register('alsoNotWorkingWithSuperRefine.status')} />
        </label>
        <button type='submit'>Submit</button>
      </form>
      {errors.workingWithRefine && <ErrorContainer title='This should be working with refine' error={errors.workingWithRefine.message} />}
      {errors.notWorkingWithRefine && <ErrorContainer title='Object refine' error={errors.notWorkingWithRefine.message} />}
      {errors.alsoNotWorkingWithSuperRefine && <ErrorContainer title='Object superRefine' error={errors.alsoNotWorkingWithSuperRefine.message} />}
    </div>
  );
}

export default App;
