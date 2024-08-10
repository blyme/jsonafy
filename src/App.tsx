import Code from "@/components/code";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Jsona } from "jsona";
import { ChangeEvent, useEffect, useState } from "react";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import { toast } from "sonner";

function App() {
  const [rawJson, setRawJson] = useState({});
  const [jsona, setJsona] = useState<Object | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);

  const formatter = new Jsona();
  const jsonaString = JSON.stringify(jsona);
  const base64EncodedString = btoa(jsonaString);

  const handleOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    // Clear the previous timeout if it exists
    if (debounceTimeout !== null) {
      clearTimeout(debounceTimeout);
    }

    // Debounce the users input.
    const newTimeout = window.setTimeout(() => {
      try {
        toast.dismiss();
        setErrors([]);
        setRawJson(JSON.parse(value));
        setJsona(formatter.deserialize(value));
      } catch (error) {
        console.error(error);
        setJsona(null);
        if (error instanceof Error) {
          setErrors([...errors, error.message]);
          toast.error(error.message, {
            duration: Infinity,
            dismissible: true,
          });
        }
      }
    }, 800);

    setDebounceTimeout(newTimeout);
  };

  // Clean up the timeout if the component unmounts.
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  return (
    <main className="App container mx-auto py-12 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2">
          <Code>JSON:API</Code>
          <span>→</span>
          <Code>jsona</Code>
        </h1>
      </div>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-8">
          <p>Insert JSON:API here</p>
          <Textarea
            className="w-full p-2 border border-gray-300 rounded-md md:h-[768px] overflow-scroll"
            onChange={handleOnChange}
            defaultValue={JSON.stringify(rawJson, null, 2)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between">
            <p>Result</p>
            <Button asChild>
              <a
                href={`https://jsonhero.io/new?j=${base64EncodedString}`}
                target="_blank"
              >
                Open in jsonhero
              </a>
            </Button>
          </div>
          <div className="w-full p-2 border border-gray-300 rounded-md md:h-[768px] overflow-scroll">
            <JsonView src={jsona ?? {}} collapsed={jsona ? false : true} />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
