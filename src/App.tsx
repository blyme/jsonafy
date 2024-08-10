import { ChangeEvent, useState } from "react";
import { Jsona } from "jsona";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Code from "@/components/code";
import { toast } from "sonner";

function App() {
  const [rawJson, setRawJson] = useState({});
  const [jsona, setJsona] = useState<Object | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const formatter = new Jsona();
  const jsonaString = JSON.stringify(jsona);
  const base64EncodedString = btoa(jsonaString);

  const handleOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    try {
      toast.dismiss();
      setRawJson(JSON.parse(e.target.value));
      setJsona(formatter.deserialize(e.target.value));
      setErrors([]);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setErrors([...errors, error.message]);
        toast.error(error.message, {
          duration: Infinity,
          dismissible: true,
        });
      }
    }
  };

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
