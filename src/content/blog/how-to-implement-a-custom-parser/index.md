---
title: "How to Implement a Custom File Parser"
description: "> Let's see how to implement a custom file parser to extend the supported files that can be uploaded in the Cat's memory"
author: "nicola"
pubDate: 2024-05-08
categories: 
  - "tutorial"
tags: 
  - "basic"
  - "hook"
  - "rabbithole"
  - "vectordb"
heroImage: "./images/Screenshot-from-2024-05-07-23-29-07.png"
---

> Let's see how to implement a custom file parser to extend the supported files that can be uploaded in the Cat's memory

By default, the RabbitHole - the component that manages the file uploading in the Cat's memory - only supports `.txt`, `.md` and `.pdf` file formats. However, we may be interested in uploading other files. The Cat parses files based on their MIME type. This means that when we upload a new file in the memory, the RabbitHole checks the file extension and select the proper parser to process it. Hence, let's see how to implement a custom parser and how to register it with the proper hook.

## The Custom Parser

A [parser](https://api.python.langchain.com/en/latest/document_loaders/langchain_core.document_loaders.base.BaseBlobParser.html) is an abstraction that allows converting raw data into pieces of text and metadata. Let's say we want to parse JSON files, here is how a basic parser would look like:

```
import json
from langchain.document_loaders.base import BaseBlobParser

class JSONParser(BaseBlobParser):

    def lazy_parse(self, blob: Blob) -> Iterator[Document]:
        # the Blob can be treated as a bytes stream
        with blob.as_bytes_io() as file:
            json_to_dict = json.load(file)
        
        dict_to_text = json.dumps(json_to_dict)
        yield Document(page_content=dict_to_text, metadata={})
```

What have we done? We defined a Python class that inherits its methods from the LangChain abstract class `BaseBlobParser`. More in detail, we have overridden the `lazy_parse` method that is called when parsing a file. This method always receives a `Blob` datatype, you can find more information about blobs [here](https://api.python.langchain.com/en/latest/document_loaders/langchain_core.document_loaders.blob_loaders.Blob.html). In this case, we are treating the blob as if we were opening a JSON and loading it as a Python dictionary. Finally, we have yielded an iterator of LangChain `[Document](https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html#langchain_core.documents.base.Document)` (one only). The latter is a datatype that stores the text in the `page_content` attribute and a dictionary of metadata in the `metadata` attribute.

## The Hook

At this point, we only miss to register the new parser in the RabbitHole. For the purpose, we need the `rabbithole_instantiates_parsers` hook (more info in [this table](https://cheshire-cat-ai.github.io/docs/technical/plugins/hooks/#__tabbed_1_3)). The hook takes a dictionary as input with key-value pairs where the keys are the MIME types and the values the associated parsers. Here is the code:

```
from cat.mad_hatter.decorators import hook

@hook
def rabbithole_instantiates_parsers(file_handlers: dict, cat) -> dict:
     
    file_handlers["application/json"] = JSONParser()
    return file_handlers
```

## Conclusions

We did it, as simple as that. In summary, we have implemented a custom parser that read a stream of bytes from a blob (like we would do from a file) and loaded the JSON content in a Python dictionary. Thus, we serialized the dictionary and stored it in the `page_content` attribute of the `Document` datatype. Finally, with the proper hook, we added the custom parser under the `"application/json"` key, which is the MIME type for JSON files.

If you are interested in tutorial that are specific for other hooks, take a look at [how to change the Cat's prompt](https://cheshirecat.ai/3-different-ways-to-change-system-prompt-in-the-cat/).
