---
title: "I tried fine-tuning Llama 3.1 8b and then hooked it up to the Cheshire Cat"
description: "As an IT technician with some experience in software development and data management, I’ve only recently ventured into the world of artificial intelligence, particularly in the fine-tuning of langu..."
author: "sandro-bild"
pubDate: 2025-04-15
categories: 
  - "tutorial"
heroImage: "./images/Flux_Dev_Descrizione_dellimmagineUn_gruppo_di_lama_eleganti_e__22.jpg"
---

#### **Premise**

As an IT technician with some experience in software development and data management, I’ve only recently ventured into the world of artificial intelligence, particularly in the fine-tuning of language models. This article was born from my hands-on exploration of the Llama 3.1 8B fine-tuning process, with the aim of creating a custom LLM tailored to specific needs to run on Ollama and connect to the Cheshire Cat. This is not a "for dummies" guide but if you frequent this blog you know that very well!

Before diving in, I want to highlight an important point: fine-tuning language models is not a trivial task when it comes to hardware requirements. While it's possible to experiment with simpler models on common hardware, for more advanced fine-tuning—especially with models from the smaller model family like Llama 3.1 8B—a significant hardware setup is still essential.

In my case, I’m working with a PC featuring **64GB of RAM**, an **Intel i5-14600K** processor, and a **RTX 4070 Ti Super** GPU with **16GB of VRAM**. While this setup is quite powerful, **a minimum of 16-32 or + GB of VRAM is generally necessary for efficient fine-tuning of models like Llama 3.1**. For those without access to such hardware, trying to fine-tune models on systems with less memory will likely lead to significant slowdowns, or worse, failure to even load the model in memory.

With more common setups—especially those lacking dedicated GPUs with a sufficient amount of VRAM—**fine-tuning becomes practically impossible**. It’s essential to have access to at least a mid-range GPU like the RTX 4070 Ti, or something comparable, to successfully run and fine-tune larger models. So, if you’re working with older hardware or a setup that doesn’t meet these requirements, I would strongly advise against attempting fine-tuning, unless you rent a cloud server or the GPUs provided by Google Colab.

**Now, with the caveat about hardware out of the way**, I’ll admit right away that, not being a machine learning expert, there may be inaccuracies or approximations in the procedural parts. However, I hope that my direct experience—with all its imperfections—can be useful to those who, like me, have decided to go beyond the use of RAG solutions, perhaps because they’re no longer sufficient for their needs, and want to take on the challenge of building a truly customized language model.

**Most of the work, as those who continue reading will discover, doesn’t lie so much in the actual fine-tuning process, but rather in the dataset preparation phase**: a step often underestimated, yet crucial to achieving coherent and high-performing results. Properly curating your dataset to ensure it aligns with the model’s intended task can make or break the fine-tuning process. If you’ve made it this far, it means you’re eager to experiment and, like me, you believe in the potential of a private LLM optimized for your specific use case.

Enjoy the read—and most importantly, happy _fine-tuning!_

#### **STEP 1: The Dataset**

**Creating a high-quality dataset for fine-tuning a language model (LLM) is a complex task that requires time, resources, and careful data handling. In this article, I’ll provide some general guidelines on how to build a structured Question-and-Answer dataset, without going too deep into the creation phase, which would deserve a separate deep dive.**

With the method I will explain below I was able to build a data set of approximately 13,000 questions and answers.

**1\. Collecting the Base Material**  
The first step is to gather all textual material related to the subject you want to specialize the LLM on. This may include:

- PDF documents (manuals, articles, regulations)

- Word files or other structured texts

- Pre-existing question sets (e.g., exam questions or FAQs)

- Online resources (web pages, forums, technical documentation)

In my case, I had a series of questions in the area of ​​local taxes that I had collected during my experience in that application domain, composed of about 80-85% questions on practical scenarios and 15-20% theoretical questions.

**2\. Automatic Extraction of Questions and Answers**  
To optimize the process, you can leverage external language models (such as those from DeepSeek, OpenAI, or Anthropic) to automatically generate question-and-answer pairs from the collected texts. I won't hide from you that I had to manage a good part of it manually…

**Recommended Method:**

- Upload PDF files or texts to the API of a capable LLM (I recommend DeepSeek for its cost-effectiveness and solid performance).

- Use structured prompting to ask the model to extract both theoretical and practical questions and generate concise answers.

**3\. Dataset Cleaning (Without Validation Set)**  
Once the raw dataset is ready, some basic cleaning is still essential:

- Manually review and correct any inaccurate answers when possible

- Try to maintain a balance between theoretical and practical questions

- Remove duplicates and ensure consistent formatting throughout

At this stage, I do not have a dedicated validation dataset to rigorously assess the quality or accuracy of the data generated, especially since I have about 13,000 questions to manage, so it was quite a feat to do it myself. As a result, the review process is limited to manual inspections and intuition-based adjustments.

While manually creating a dataset is the most accurate approach, using external LLMs can significantly reduce development time. With a hybrid method (automated generation + human review), it’s possible to obtain a reasonably good dataset without spending months of work—even in the absence of a proper validation set.

**The recommendation to avoid "crashes" during training is to clean the dataset from any anomalous characters and pay attention to the length of the texts that is not greater than the max\_seq\_length. In my case I sized the text to a maximum of 4096 tokens**

#### **STEP 2: Large Language Model choice**

**Why I Chose Llama3.1 8B for Fine-Tuning My LLM**

When I decided to fine-tune a language model, I chose **Llama3.1 8B** for several practical and technical reasons.

1. **Balance Between Performance and Size**: Llama3.1 8B offers a good compromise between generative capabilities and efficiency. Larger models (e.g., 70B) would be unmanageable with my **RTX 4070 Ti Super (16GB VRAM)**, while smaller versions (e.g., 1-3B) would sacrifice too much quality.

3. **Optimized for Consumer Hardware**: With only 8 billion parameters, the model is light enough to run locally without requiring clusters or professional GPUs, making full use of my GPU's capabilities.

5. **Support for Efficient Fine-Tuning**: Llama3.1 integrates techniques like LoRA and QLoRA, which allow the model to be trained even with limited VRAM, optimizing resources and time.

7. **Established Community and Tools**: Being an open-source model with strong community support, I found ready-to-use libraries, guides, and optimizations, which reduced development time.

#### **STEP 3: Preparing the development environment**

For the _fine-tuning_ process of the language model (LLM), I opted for a flexible development environment and powerful supporting tools. The chosen editor is Visual Studio Code (VSCode), a versatile environment that, thanks to dedicated extensions (such as Jupyter, Python, and Pylance), allows for smooth work with .ipynb (Jupyter Notebook) files. This format has proven to be particularly convenient for testing and running code blocks in isolation, making debugging and step-by-step analysis during training much easier.

**Libraries and Frameworks Used**  
The core of the project involved the use of:

- **Unsloth**: An optimized library designed to speed up LLM fine-tuning by reducing memory consumption and improving computational efficiency.

- **LoRa (Low-Rank Adaptation)**: A technique that allows for adapting large models with a reduced number of trainable parameters, cutting down computational costs without sacrificing performance too much.

- **PyTorch (Torch)**: The deep learning framework at the heart of the implementation, essential for managing the training loop and optimizing the model.

**The CUDA Challenge with the RTX 4070 Ti Super GPU**  
One of the most significant challenges was configuring CUDA to fully leverage the power of the NVIDIA RTX 4070 Ti Super GPU. Despite theoretical compatibility, I encountered issues with drivers and versioning between CUDA, PyTorch, and Unsloth kernels. After several attempts, I resolved this by updating:

- The NVIDIA drivers to the latest version.

- The CUDA toolkit to version 12.4, which is compatible with PyTorch 2.0+.

- The bitsandbytes and flash-attention libraries, which were recompiled to support Ada Lovelace architectures.

The code below you can:

- Check if PyTorch can use the GPU to accelerate deep learning operations.

- Check how many GPUs are available.

- Identify the model of the installed GPU.

- Prints the installed version of PyTorch (ex: PyTorch version: 2.1.0). Useful for checking compatibility with other libraries or features.

- Check if a CUDA (GPU parallel computing library) compatible NVIDIA GPU is available.

- Print CUDA available: True if PyTorch can use the GPU, False otherwise.

```
import torch
print(torch.cuda.is_available())
print(torch.cuda.device_count())
print(torch.cuda.get_device_name(0))
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
```

If you have a CUDA-compatible NVIDIA GPU the result will be something like this:

```
True1NVIDIA Name of GPU PyTorch version: 2.6.0+cu124CUDA available: True 
```

**Everything's ready! We can start!**

_P.S.: For those using next-generation GPUs, I always recommend checking the compatibility of the libraries with the specific architecture before starting the training!_

#### **STEP 4: Model Initialization and efficient optimization with LoRA**

Once we have verified that the CUDA drivers work in conjunction with Pytorch, we proceed to initialize the model.

```
from unsloth import FastLanguageModel
import torch
max_seq_length = 4096 # Choose any! We auto support RoPE Scaling internally!
dtype = None # None for auto detection. Float16 for Tesla T4, V100, Bfloat16 for Ampere+
load_in_4bit = True # Use 4bit quantization to reduce memory usage. Can be False.

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Meta-Llama-3.1-8B-Instruct",
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
    device_map = "auto"  
)

print("Device mapping:", model.hf_device_map)
print("Model is on:", next(model.parameters()).device)
```

In the context of optimizing LLMs (Large Language Models), the Unsloth library stands out for its ability to accelerate both training and inference. With this code I see you how to efficiently load an optimized Llama-3-8B model for instruction tasks, leveraging advanced techniques in quantization and automatic hardware resource management.

**Main Configuration**

- **Maximum sequence length**: 4096 tokens, with automatic support for RoPE Scaling to accommodate longer contexts.

- **4-bit quantization**: Enabled (load\_in\_4bit=True) to drastically reduce memory consumption, ideal for GPUs with limited resources.

- **Automatic data type**: The parameter `dtype=None` autonomously detects the optimal precision (e.g., float16 for NVIDIA T4/V100 GPUs, bfloat16 for Ampere+).

**Model Loading** The call to `FastLanguageModel.from_pretrained()` uses:

- A pre-trained model (unsloth/Meta-Llama-3.1-8B-Instruct), already optimized for Unsloth.

- **Automatic device mapping**: The `device_map="auto"` option distributes the model across GPU/CPU based on availability, without requiring manual intervention (avoiding the need for `model.to(device)`).

At this point we implement LoRA (Low-Rank Adaptation) an efficient fine-tuning technique that reduces computational consumption by updating only a small portion of the model's parameters.

```
model = FastLanguageModel.get_peft_model(
    model,
    r = 16, # Choose any number > 0 ! Suggested 8, 16, 32, 64, 128
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj",],
    lora_alpha = 16,
    lora_dropout = 0, # Supports any, but = 0 is optimized
    bias = "none",    # Supports any, but = "none" is optimized
    # [NEW] "unsloth" uses 30% less VRAM, fits 2x larger batch sizes!
    use_gradient_checkpointing = "unsloth", # True or "unsloth" for very long context
    random_state = 3407,
    use_rslora = False,  # We support rank stabilized LoRA
    loftq_config = None, # And LoftQ
)
```

The `get_peft_model` function configures a LoRA adaptation for a language model, specifying:

- **r = 16**: the rank of the low-rank adaptation matrices (typical values: 8-128).

- **target\_modules**: the layers of the model to apply LoRA to (e.g., query/key/value projections in transformers).

- **lora\_alpha** and **dropout**: hyperparameters to control learning and regularization.

- **use\_gradient\_checkpointing = "unsloth"**: optimization that reduces VRAM usage by 30%, allowing for larger batches.

This configuration strikes a balance between efficiency and performance, typical in scenarios where resources are limited. Approaches like stabilized LoRA (rslora) or quantized LoRA (loftq) are supported but not enabled in this example.

To make sure the model has been loaded correctly let's try to do inference. I used this code:

```
from unsloth.chat_templates import get_chat_template

tokenizer = get_chat_template(
    tokenizer,
    chat_template = "llama-3.1",
)
FastLanguageModel.for_inference(model) # Enable native 2x faster inference

messages = [
    {"role": "user", "content": "Cosa disciplina il D.Lgs. 507/1993 in materia di tributi locali?"},
]
inputs = tokenizer.apply_chat_template(
    messages,
    tokenize = True,
    add_generation_prompt = True, # Must add for generation
    return_tensors = "pt",
).to("cuda")

from transformers import TextStreamer
text_streamer = TextStreamer(tokenizer, skip_prompt = True)
_ = model.generate(input_ids = inputs, streamer = text_streamer, max_new_tokens = 128,
                   use_cache = True, temperature = 1.0, min_p = 0.1)
```

You will notice that if you ask a very specific question to the model, he will answer you in a very generic way if not completely wrong and very far from the answer you expect.

#### **STEP 5: Text formatting in Llama3.1 format and dataset converting**

Running this code configures the tokenizer with the specified chat template ("llama-3.1").  
This is useful to ensure that the model processes chat inputs in a format consistent with the one used during training, improving performance in conversational contexts.

```
from unsloth.chat_templates import get_chat_template

tokenizer = get_chat_template(
    tokenizer,
    chat_template = "llama-3.1",
)
```

Now let's move on to loading the dataset. I used the pandas library

```
import pandas as pd
df = pd.read_csv("./dataset.csv")
```

I display the first few rows of the dataframe to make sure the loading was successful

```
df.head()
```

|  | User | Prompt |
| --- | --- | --- |
| 0 | "Chi è il soggetto passivo dell'IMU?" | "Il soggetto passivo dell'IMU (Imposta Municip... |
| 1 | "IMU - Imposta Municipale Propria" | "L'IMU (Imposta Municipale Propria) è un'impos... |
| 2 | "Qual è il presupposto dell'IMU?" | "Il presupposto dell'IMU (Imposta Municipale P... |
| 3 | "Quali immobili sono soggetti a IMU?" | "L'IMU (Imposta Municipale Unica) è dovuta per... |
| 4 | "Quali immobili sono esenti da IMU?" | "Sono esenti da IMU i seguenti immobili: 1. A... |

We eliminate any empty rows present in the dataset

```
df = df.dropna()
```

Once the empty rows have been eliminated and the dataframe has been verified to be populated correctly, we proceed to transform the pandas DataFrame into a HuggingFace dataset, structuring it in a format suitable for conversations (such as those used in chat models).

```
from datasets import Dataset
df["conversations"] = df.apply(
    lambda x: [
        {"content": x["User"], "role": "user"},
        {"content": x["Prompt"], "role": "assistant"}
    ], axis=1
)

Converting DataFrame to a HuggingFace Dataset, removing old columns
dataset = Dataset.from_pandas(df.drop(columns=["User", "Prompt"]))
```

Let's check that the conversation structure is correct after the transformation by displaying the first 100 lines

```
dataset ['conversations'] [100]
```

#### **STEP 6: Training Settings**

At this point we have arrived at the heart of the project, that is, the training settings which are decisive both for the quality of the training itself and for the time that the GPU will take to carry out all the steps.

When I decided to fine-tune a language model, I wanted to optimize every aspect of the training process to balance efficiency and result quality. Using the `trl` library with `SFTTrainer`, I structured the process to suit my dataset and available resources.

The first crucial decision was the **formatting function** (`formatting_func`), which transforms the conversations in my dataset into a format readable by the model. I preferred this approach over using a predefined text field because it allowed me to control exactly how the "User" and "Assistant" messages were concatenated, maintaining a clear and coherent structure.

For the trainer, I set `max_seq_length=4096` to fully leverage the model's capacity to handle long contexts, while avoiding memory overload. I chose `packing=False` because, although it can speed up training for short sequences, in my case I preferred to maintain precise control over batching. And also I noticed that using batch packing the processing slowed down tragically

The **training settings** (`TrainingArguments`) reflect several optimizations:

- **Batch size and gradient accumulation**: With `per_device_train_batch_size=2` and `gradient_accumulation_steps=4`, I balanced GPU memory usage and the stability of weight updates, achieving an effective batch size of 8.

- **Learning rate and optimization**: A learning rate of `2e-4` with `adamw_8bit` provided a good balance between convergence speed and stability, while `max_grad_norm=0.3` helped prevent exploding gradients.

- **Mixed precision**: I enabled `fp16` or `bf16` based on hardware support (`is_bfloat16_supported`) to reduce memory usage without sacrificing critical precision.

- **LR scheduling**: Using `cosine` for `lr_scheduler_type` ensures a gradual decay of the learning rate, improving final convergence.

- **Logging and reproducibility**: With `logging_steps=1`, I monitor every step, while `seed=3407` ensures reproducibility.

Lastly, I disabled external reporting (`report_to="none"`) for simplicity, though this option can be useful with tools like WandB. The output path `output_dir="outputs"` organizes the training results into a dedicated folder.

These choices stem from a trade-off between speed, stability, and quality, tailored to the specifics of my task and available resources. Each parameter is the result of several tests and retests that I have done. **It is not a given, in fact, that the training begins and ends without a "crash" of the vram. It happened to me several times and only several attempts I managed to complete the training. Pay special attention to the batch size**

After setting the training settings, I configured the trainer so that during training, the model learns mainly from the assistant's answers, without "getting distracted" too much by the user's instructions. This can be useful to optimize the generation of consistent and relevant answers. I did it with this code:

```
from unsloth.chat_templates import train_on_responses_only
trainer = train_on_responses_only(
    trainer,
    instruction_part = "<|start_header_id|>user<|end_header_id|>\n\n",
    response_part = "<|start_header_id|>assistant<|end_header_id|>\n\n",
)
```

**In the meantime, let's not forget to take a look at the vram to avoid unpleasant surprises. I check the memory status with the following code:**

```
import torch
gpu_stats = torch.cuda.get_device_properties(0)
start_gpu_memory = round(torch.cuda.max_memory_reserved() / 1024 / 1024 / 1024, 3)
max_memory = round(gpu_stats.total_memory / 1024 / 1024 / 1024, 3)
print(f"GPU = {gpu_stats.name}. Max memory = {max_memory} GB.")
print(f"{start_gpu_memory} GB of memory reserved.")
```

#### I'd say we're all set to unleash our GPU!

```
trainer_stats = trainer.train()
```

A table will start to appear showing the training loss for each step. "Training loss" refers to a metric used to evaluate how well a machine learning model is performing during training. It measures the difference between the predicted output and the actual output, with the goal of minimizing the loss over time to improve model accuracy.

The processing time will depend on the size of the dataset as well as your gpu. For my dataset of 13,000 questions it took almost 12 hours on 2000 steps, in total the model saw the entire dataset approximately 3 times. Luckily I have solar power!

In my case, the training loss started at a value of 1.64 and reached a value between 0.84 and 0.92 in the final steps. Not bad, I must say.

Besides the training loss, another very important value to consider in a machine learning process is the validation loss.

The validation loss is calculated on a validation dataset that was not used during the model’s training. It is crucial because it provides an estimate of how well the model generalizes to data it has never seen before. A model that has a low training loss but a high validation loss might be overfitting the training data, meaning it has learned the specific details of that data too well but fails to generalize to new data.

Therefore, to properly evaluate the performance of a model, it is essential to monitor both the training loss and the validation loss during the training process. In our case, since it is a demonstration test as mentioned above, I didn’t have data for validation.

At the end of the training you will be really curious to ask that question to which the model had answered inaccurately or invented. And so let's do INFERENCE!

```
FastLanguageModel.for_inference(model) # Enable native 2x faster inference

messages = [
    {"role": "user", "content": "Scrivi qui la tua domanda e scopri se hai perso solo tempo"},
]
inputs = tokenizer.apply_chat_template(
    messages,
    tokenize = True,
    add_generation_prompt = True, # Must add for generation
    return_tensors = "pt",
).to("cuda")

from transformers import TextStreamer
text_streamer = TextStreamer(tokenizer, skip_prompt = True)
_ = model.generate(input_ids = inputs, streamer = text_streamer, max_new_tokens = 256,
                   use_cache = True, temperature = 1.2, min_p = 0.1)
```

#### **STEP 7: Weights export and conversion model in GGUF**

Great! At this point, all that's left is to save the model weights and the tokenizer into a chosen folder.

```
model.save_pretrained("model3-8b")
tokenizer.save_pretrained("model3-8b")
```

The weights alone are of little use to us: for our goal, which is to run our Ollama-trained LLM, we need the entire model with updated weights. I used the following code to merge the model. Needless to say, you'll need several gigabytes of free space on your hard drive.

```

from peft import PeftModel, PeftConfig
from transformers import AutoModelForCausalLM, AutoTokenizer

# Loading adaptor configuration
peft_config = PeftConfig.from_pretrained("model3-8b")

# Loading base model
base_model = AutoModelForCausalLM.from_pretrained(
    peft_config.base_model_name_or_path,
    device_map="auto",
    torch_dtype="auto"
)
tokenizer = AutoTokenizer.from_pretrained(peft_config.base_model_name_or_path)

# Loading model with adapter
model = PeftModel.from_pretrained(base_model, "model3-8b")

# Merge adapters to base model
merged_model = model.merge_and_unload()

# Save model merged
merged_model.save_pretrained("merged_model3-8b")
tokenizer.save_pretrained("merged_model3-8b")
```

**And as an old song by Antonello Venditti used to say: "\[…\] E quando pensi che sia finita, è proprio allora che comincia la salita!\[…\]"**

At this point, we need llama.cpp. A quick digression: llama.cpp is an open-source library written in C/C++ that allows large language models (LLMs), such as Meta’s LLaMA, to run locally on a CPU or GPU, without the need for Python or specialized hardware. It was developed by Georgi Gerganov starting in March 2023 and has since become a popular tool for efficiently running AI models on consumer devices, including laptops, Raspberry Pi, and Android smartphones. It also includes some Python utilities that allow you to convert an LLM from the HuggingFace format to GGUF.

Everything would be so easy and wonderful if we could just pass a command to the script to convert our LLM into GGUF—but no! Since our merged model is quantized in NF4 (NormalFloat4) and llama.cpp doesn’t support converting models with this type of quantization, we had to dequantize it to F16 in order to convert it to GGUF, which unfortunately resulted in a larger model size.

```
from unsloth import FastLanguageModel
from transformers import AutoTokenizer
import torch

# 1.Loading explicit tokenizer
tokenizer = AutoTokenizer.from_pretrained(
    "E:/Programmazione/Python/Addestramento/merged_model3_8b",
    trust_remote_code=True
)

# 2.Loading model with correct configuration
model, _ = FastLanguageModel.from_pretrained(
    model_name = "E:/Programmazione/Python/Addestramento/merged_model3_8b",
    max_seq_length = 4096,
    dtype = torch.float16,
    load_in_4bit = True,
    token = None,
    device_map = "auto",
)

# 3. Preliminary verification
print("Modello caricato correttamente?", model is not None)
print("Tokenizer caricato correttamente?", tokenizer is not None)

# 4. Export in GGUF with added parameters
model.save_pretrained_gguf(
    save_directory = "E:/Programmazione/Python/Addestramento/dequantized_model",
    tokenizer = tokenizer,
    quantization_method = "f16",
    push_to_hub = False,
    max_shard_size = "10GB",
)
```

Now, to finally obtain the GGUF file, open the terminal in the llama.cpp folder — it's usually located at 'C:\\users\\YourUsername\\.llama.cpp' — and run the following script:  

```
python convert-hf-to-gguf.py \ "E:/Programmazione/Python/Addestramento/dequantized_model" \ --outfile "E:/Programmazione/Python/Addestramento/merged_model3_8b.gguf" \--outtype f16 
```

At the end of the process, you will find your GGUF model in the folder .\\llama.cpp\\models

#### **STEP 8: Create my fine tuned model in Ollama**

I’d say we’re finally out of the tunnel. Obviously the necessary prerequisite is to have Ollama installed on your PC/server. Now we just need to recreate the model within Ollama using our generated GGUF file. But first, it’s necessary to create the model’s 'identity card' that will be presented to Ollama. In the 'Modelfile', a number of details about the model must be specified, such as the chat template, context length, creativity parameters, and a system prompt that tells the model who it is and what its specific task is. Below is an example of a Modelfile you can use.

```
FROM merged_model3_8b.gguf

### PARAMETERS ###
PARAMETER temperature 0.8 
PARAMETER top_k 40
PARAMETER top_p 0.8
PARAMETER num_ctx 4096
PARAMETER num_gpu 50  
PARAMETER repeat_penalty 1.2 
PARAMETER num_predict 1024

### STOP TOKEN ###
PARAMETER stop "<|start_header_id|>"
PARAMETER stop "<|end_header_id|>"
PARAMETER stop "<|eot_id|>"
PARAMETER stop "Cutting Knowledge Date:"
PARAMETER stop "###"  # Fallback aggiuntivo

### TEMPLATE LLAMA 3.1###
TEMPLATE """<|begin_of_text|>
{{- if .System }}<|start_header_id|>system<|end_header_id|>
{{ .System }}<|eot_id|>
{{- end }}
<|start_header_id|>user<|end_header_id|>
{{ .Prompt }}<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
"""

### CONTESTO SPECIFICO ###
SYSTEM """Parla in italiano. Sei Carlo, esperto tributarista. 
Argomenta la risposta anche con riferimenti normativi in massimo 12 frasi. 
Esempio: "L'articolo 53 TUIR prevede che...". 
Non generare testo oltre la risposta."""
```

So now place the Modelfile and your model GGUF in the folder 'C:\\Users\\YourUser\\.ollama\\models', open the terminal while staying in the same directory, and run the following command:

```
ollama create YourModelName -f Modelfile
```

#### Congratulations!

You can now consult your model, trained by yourself, even through the Cheshire Cat!

#### **Final thoughts**

Training an 8-billion-parameter LLM on a small dataset with limited hardware resources is a significant challenge, but the use of optimization techniques like LoRa and unsloth has allowed the experiment to continue. But not having a validation dataset and the relatively short training duration I could have obtained an even more performing model with the possibility of generalizing even better on data never seen before. I ran some tests on specific questions and I must say that it did not go too badly. Sure, you can see that it does not have the precision of the giants at 70 - 200 or 400 billion parameters, I still have the doubt that using a validation dataset and increasing the number of training passes would lead to a better performance of the model, but frankly so much work for an experiment is not justified and so for now, I consider myself satisfied. You could try it and let me know how it went!
