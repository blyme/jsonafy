import Code from "@/components/code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Jsona } from "jsona";
import { useState } from "react";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import { toast } from "sonner";
import { z } from "zod";

function App() {
  const formatter = new Jsona();
  const [rawJson, setRawJson] = useState({
    data: {
      type: "town",
      id: "123",
      attributes: {
        name: "Copenhagen",
      },
      relationships: {
        country: {
          data: {
            type: "country",
            id: "32",
          },
        },
      },
    },
    included: [
      {
        type: "country",
        id: "32",
        attributes: {
          name: "Denmark",
        },
      },
    ],
  });
  const [jsona, setJsona] = useState(formatter.deserialize(rawJson));
  const [insertedJson, setInsertedJson] = useState("");
  const urlSchema = z.string().url();
  const jsonSchema = z.string().transform((value) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error("Invalid JSON");
    }
  });

  const handleConvert = async () => {
    if (urlSchema.safeParse(insertedJson).success) {
      return GETJsonFromURL(insertedJson);
    }

    if (jsonSchema.safeParse(insertedJson).success) {
      try {
        const parsedJson = JSON.parse(insertedJson);
        setRawJson(parsedJson);
        setJsona(formatter.deserialize(parsedJson));
      } catch (error) {
        return toast.error("Invalid JSON data.");
      }
      return;
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
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Insert URL or JSON:API data..."
              value={insertedJson}
              onChange={(e) => setInsertedJson(e.target.value)}
            />

            <Button onClick={handleConvert}>Convert</Button>
          </div>
          <div className="w-full p-2 border border-gray-300 rounded-md overflow-scroll md:h-[768px]">
            <JsonView src={rawJson} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() => postJsonToJsonHero(jsona ?? { foo: "bar" })}
            >
              Open in jsonhero
            </Button>
          </div>
          <div className="w-full p-2 border border-gray-300 rounded-md  overflow-scroll md:h-[768px]">
            <JsonView src={jsona ?? {}} collapsed={jsona ? false : true} />
          </div>
        </div>
      </section>
    </main>
  );

  async function GETJsonFromURL(url: string) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        toast.error("Error fetching JSON from URL.");
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRawJson(data);
      setJsona(formatter.deserialize(data));
      return data;
    } catch (error) {
      toast.error(
        "Error fetching JSON from URL. Please check the console for more information."
      );
      console.error("Error fetching JSON from URL:", error);
    }
  }
}

export default App;

async function postJsonToJsonHero(jsona: Object) {
  const requestBody = {
    title: "From JSON:API to JSONA",
    content: jsona,
    readOnly: false,
  };

  try {
    const response = await fetch("https://jsonhero.io/api/create.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    window.open(data.location, "_blank");
  } catch (error) {
    toast.error(
      "Error communicating with jsonhero. Please see the console for more information."
    );
    console.error("Error communicating with jsonhero:", error);
  }
}
