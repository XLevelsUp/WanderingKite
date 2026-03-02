import { NewClientForm } from './NewClientForm';

export default function NewClientPage() {
  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Add Client</h1>
        <p className='text-slate-500 mt-2'>
          Register a new client in the system
        </p>
      </div>

      <NewClientForm />
    </div>
  );
}
