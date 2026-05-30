import "./App.css";
import SchedaClientiForm from "./components/scheda-clienti-form";

function App() {
  return (
    <>
      <main className="p-4 md:p-8">
        <div className="mx-auto max-w-5xl">
          <SchedaClientiForm />
        </div>
      </main>
    </>
  );
}

export default App;
