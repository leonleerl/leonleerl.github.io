---
title: Natural Language Processing
date: 2025-10-15 14:46:07
updated: 2026-05-08 09:43:32
categories:
  - NLP
---

# Lecture 1 Introduction

## Overview of NLP
What we will learn in this course ⬇️
* NLP and Machine Learning (lecture 1 - lecture 4)
* NLP Techniques (lecture 5 - lecture 8)
* Advanced topic (lecture 9 - lecture 12)
![image](/blogs/natural-language-processing-notes/1.png)

Let's have a look at the chart first ⬇️
![image](/blogs/natural-language-processing-notes/2.png)

<!-- more -->

Based on the chart above, the differences between **Classical NLP** and **Deep Learning-based NLP** are:

| Classical | Deep Learning |
|--------|--------|
| Procedure Complex | Procedure Simpler |
| Lots of Pre-processing | Easy Pre-processing |
| Each natural language needs an individual processing pipeline | Is able to process multiple tasks in one model |
| Manually Feature Extraction | Automatically Feature Extraction by hidden layer |
| Rely on Linguistical knowledge | Word Embedding (word2vec, GloVe...) |
| Low Scalability | High Scalability |

---

**Why Process Language?**
* language stores knowledge
* language communicates new knowledge
* language is a key to culture and human experience
* language is a natural interface for human

---

**What is Natural Language Processing?**

NLP is the branch of AI focused on developing systems that allow computers to communicate with people using everyday language.

---

**Ambiguity is Explosive**

Ambiguities compound to generate enormous numbers of possible interpretations.

In English, a sentence ending in n prepositional phrases has over 2n interpretations.
* “I saw the man with the telescope”: 2 parses
* “I saw the man on the hill with the telescope.”: 5 parses
* “I saw the man on the hill in Texas with the telescope”: 14 parses
* “I saw the man on the hill in Texas with the telescope at noon.”: 42 parses
* “I saw the man on the hill in Texas with the telescope at noon on Monday” 132 parses

## Word Meaning and Representation

One common solution is `WordNet`, but it has a lot of problems:
* Great as a resource but missing nuance
    * e.g., “proficient” is listed as a synonym for “good”. This is only correct in some contexts.
    * e.g., “good” can be synonym for “serious”???
* Missing new meanings of words
    * e.g., wicked, badass, nifty, wizard, genius, ninja, bombast
    * Impossible to keep up-to-date!
* Subjective
* Requires human labor to create and adapt
* Can’t compute exact and accurate word similarity

## Count-based Word Representation

### One-hot Encoding
Each integer value is represented as a binary vector that is all zeros values except the index of the integer, which is marked with a 1.
![image](/blogs/natural-language-processing-notes/3.png)

---

Problems with One-hot Encoding:
1. No word similarity representation
2. Inefficiency

### Bag of Words (BoW)
A bag-of-words model (BoW) is a representation of text that describes the occurrence of words within a document. It involves two things:
* A vocabulary of known words.
* A measure of the presence of known words.

So it can be used for:
* Classification (Spam Detection, Sentiment Analysis)
* Similarity between different documents
![image](/blogs/natural-language-processing-notes/4.png)

---

Problems with BoW:
* Lost the sequence information of words (e.g. "dog bites man" and "man bites dog" will be detected as the same)
* The matrix is sparse when the dimension goes higher
* Can't understand new words.

### Term Frequency-Inverse Document Frequency
Short for `TF-IDF`.

**Definition**

A statistical measure used to evaluate the importance of a word to a document in a collection of documents.
Formula: TF-IDF = TF × IDF

---

TF (Term Frequency): Frequency of the term in the document

IDF (Inverse Document Frequency): log(Total number of documents / Number of documents containing the term)

Higher frequency in current document → Higher TF → More important

More common across all documents → Lower IDF → Less important

---

**Example**

Suppose we have 3 documents:

Document 1: "machine learning is interesting"

Document 2: "deep learning is a branch of machine learning"

Document 3: "I like learning"

For words in Document 2:

"learning": High TF, but low IDF (appears in all 3 documents) → Lower TF-IDF

"deep": Moderate TF, but high IDF (appears in only 1 document) → Higher TF-IDF

"is"/"a": May have high TF, but very low IDF (common stop words) → Very low TF-IDF

# Lecture 2 Word Embeddings and Representation

## Introduction to the concept "Prediction"

### Count-based Word Representation

Count-based methods are what we have learned: One-hot, Bag of Words, TF-IDF.

They are sparse and lack the ability in semantics expression. As a result, we need **dense embedding**.

### Prediction-based Word Representation

Core thinking: "You shall know a word by the company it keeps".

So, to get the **word embedding**, we can use the neural network to train the model to predict the context of a certain word.

---

We can use the **Cosine Similarity**.

![image](/blogs/natural-language-processing-notes/5.png)

## Word2Vec

### CBOW

CBOW is short for `Continuous Bag of Words`. The aim is to predict the target single word based on the context.

The neural network has 3 layers:

1. Input Layer
2. Hidden Layer
3. Output Layer

Here, I will use a simple example given by ChatGPT to understand how those 3 layers work.

Assume we have only 4 words in our vocabulary:

| Word | Index |
|--------|--------|
| I | 0 |
| love | 1 |
| deep | 2 |
| learning | 3 |

Task: 

We want the model to predict the centre word “love”, given the context words “I” and “deep”.

So:

```
Context words → ["I", "deep"]
Target (center word) → "love"
```

**Step 1: Input Layer**

Each word is a one-hot vector (size = vocabulary size = 4):

| Word | One-hot vector |
|--------|--------|
| I | [1, 0, 0, 0] |
| love | [0, 1, 0, 0] |
| deep | [0, 0, 1, 0] |
| learning | [0, 0, 0, 1] |

So our input layer is:

```
x₁ = [1, 0, 0, 0]   → “I”
x₂ = [0, 0, 1, 0]   → “deep”
```

**Step 2: Hidden Layer**
We use a weight matrix W, embedding size N = 2.

Assume W is 2*4:

| | |
|--------|--------|
| 0.2 | 0.4 |
| I 0.1 | 0.3 |
| love 0.7 | 0.5 |
| deep 0.6 | 0.9 learning |

Now multiply each one-hot vector by W:

* For “I”: [1,0,0,0] × W = [0.2, 0.4]
* For “deep”: [0,0,1,0] × W = [0.7, 0.5]

Then we average them (CBOW averages all context embeddings):

v = ([0.2,0.4] + [0.7,0.5]) / 2 = [0.45, 0.45]

This [0.45, 0.45] is our hidden layer output — the context representation.

![image](/blogs/natural-language-processing-notes/9.png)

![image](/blogs/natural-language-processing-notes/10.png)

![image](/blogs/natural-language-processing-notes/11.png)

After understanding this simple instance, you might be able to understand ⬇️

![image](/blogs/natural-language-processing-notes/6.png)

![image](/blogs/natural-language-processing-notes/7.png)

![image](/blogs/natural-language-processing-notes/8.png)

### Skip-Gram

The aim is to predict the context words based on the given centre single word.

### Limitation

The limitation of Word2Vec:

1. **Morphological Issues:** Similar words such as teach/teacher/teaching are treated as different vectors.
2. **Rare Word Problem:** Low-frequency words are insufficiently trained.
3. **OOV (Out-of-Vocabulary) Problem:** New words outside the vocabulary cannot be represented.

## FastText

Made by Facebook AI Research.

Breaks words into n-gram subword units for training. 

Example: apple → { app, ppl, ple }; word vector = sum of subword vectors.

**Advantages:**
* Supports rare words and new words (OOV);
* Captures morphological features (teach/teacher).

## GloVe

Addresses Word2Vec's limitation of focusing only on local context windows. 

Learns global distribution through P(k|i) (probability of context word k given centre word i).

Performs well on analogy tasks (king − man + woman ≈ queen).

# Lecture 3 Word Classification with Machine Learning

## Word Embedding Evaluation

### Intrinsic Evaluation
Evaluates embeddings directly on linguistic subtasks.

Example: `Word Analogies`:

“man : woman :: king : ?” → model should output queen using vector arithmetic and cosine similarity.

![image](/blogs/natural-language-processing-notes/12.png)

### Extrinsic Evaluation
Assesses embeddings on real NLP tasks: `POS tagging`, `Dependency Parsing`, `Language Modelling` etc.

* Advantage: Measures end-to-end performance (real outcome).
* Disadvantage: Training and interpretation are slower and more complex.

![image](/blogs/natural-language-processing-notes/13.png)

## Deep Neural Network for NLP

### Perceptron and Neural Network (NN)

What is Perceptron?

A single neuron:
* Inputs = features (e.g. word embeddings).
* Weights & bias adjust during training.
* Activation function f(·) adds non-linearity.

Common Activation Functions:
* `Sigmoid`: Smooth probabilities (0–1)
* `Tanh`: Output range (–1, 1)
* `ReLU`: max(0, x), prevents vanishing gradient

![image](/blogs/natural-language-processing-notes/14.png)

### Multilayer Perceptron
Input -> Hidden -> Output

Multilayer Perceptron can learn non-linear patterns. 

Now we need to understand an important concept `Back-propagation`.

Back-propagation is the practice of fine-tuning the weights of a neural net based on the error rate (i.e. loss) obtained in the previous epoch (i.e. iteration). Proper tuning of the weights ensures lower error rates, making the model reliable by increasing its generalisation.

![image](/blogs/natural-language-processing-notes/15.png)

To understand Back-propagation, here's a real example:
![image](/blogs/natural-language-processing-notes/19.png)

**Cost Function -Method 1: `MSE` (Mean Squared Error)**

Mean Square Error (MSE) is the most commonly used regression loss function. MSE is the average of squared distances between our target variable and predicted values

![image](/blogs/natural-language-processing-notes/16.png)

**Cost Function -Method 2: `ACE` (Averaged Cross Entropy Error)**

Cross-entropy loss, or log loss, measures the performance of a classification model whose output is a probability value between 0 and 1. Cross-entropy loss increases as the predicted probability diverges from the actual label. 

![image](/blogs/natural-language-processing-notes/17.png)

Here comes another important concept `Gradient (Optimiser)`

In neural networks, the key technique to arrive at the optimal weights is the Gradient Descent algorithm. This algorithm relies on a hyperparameter called the learning rate, which allows one to moderate the rate of weight change, such that the cost function is minimised.

![image](/blogs/natural-language-processing-notes/18.png)

# Lecture 4 Sequence Model and Recurrent Neural Networks

## Seq2Seq Learning

Goal: Extend standard machine learning (N-to-1, N-to-N tasks) to handle `temporal sequences`.

The key innovation is introducing the concept of “time” — treating each word as part of a sequence rather than an independent item.

| Task Type | Example | Description |
|--------|--------|--------|
| N→1 | Sentiment Analysis | Input a sentence, output one label |
| N→N | PoS Tagging | Each word has a tag |
| N→M | Translation | Input English, output Chinese |

Examples:
* **Speech recognition:** Speech → Text
* **Video labelling**: Frames → Scene Labels
* **PoS tagging**: Words → Tags
* **Machine translation**: English → Chinese
* **Dialogue / Chatbot**: Input sentence → Response
* **Sentence completion**: Predict missing or next words

## Seq2Seq Deep Learning

### RNN(Recurrent Neural Network)
**Process**:
1. **Input Sequence** - Feed sequential data (text, time series) into the network one element at a time
2. **Hidden State Initialisation** - Set initial hidden state h₀ (usually zero vector)
3. **Recurrent Processing** - At each time step t:
    * Receive current input xₜ and previous hidden state hₜ₋₁
    * Compute new hidden state: hₜ = f(Wₓₓ·xₜ + Wₕₕ·hₜ₋₁ + b)
    * Where f is an activation function (such as tanh or ReLU)
4. **Output Generation** - Generate output yₜ based on current hidden state hₜ
5. **State Propagation** - Pass hₜ to the next time step
6. **Repeat** - Repeat steps 3-5 for each element in the sequence

**Problem**: 
1. Vanishing Gradient Issue
2. Exploding Gradient

![image](/blogs/natural-language-processing-notes/20.png)

### LSTM(Long Short-Term Memory)

LSTM introduces `gates` to control what information to keep or forget.

Information from the previous hidden state and information from the current input are passed through the `sigmoid function`. Values come out between 0 and 1. The closer to 0 means to forget, and the closer to 1 means to keep.

LSTM solves the vanishing gradient by preserving long-term information via `cell state`.

![image](/blogs/natural-language-processing-notes/21.png)

### GRU(Gated Recurrent Unit)

![image](/blogs/natural-language-processing-notes/22.png)

## Data Transformation for Deep Learning NLP

Purpose: Prepare textual data for input into neural networks.

Examples:
* Image classification → pixels to classes
* Topic classification → document to label
* Visual Q&A → image + question → answer

**Data Transformation Techniques**

![image](/blogs/natural-language-processing-notes/22.png)

# Lecture 5 Language Fundamental

## Sequential Text Classification

Used for `sentiment analysis`, `PoS tagging`, `sequence labelling`, etc.

### RNN (N -> 1 Task)

Input: sequence of words → Output: single label (e.g., positive/negative sentiment).

### Bi-RNN and Bi-LSTM

Process sequence in both directions (forward & backward).

Combine information via concatenation or summation.

Summation is more efficient but may cause `information leakage`.

### Application: Sentiment Analysis

**Sentiment analysis** identifies the emotion, attitude, or opinion expressed in text.

**Key Challenges**:

1. Sarcasm Detection
    * Positive words used to express negative intent.
    * Context understanding is essential.
2. Word Ambiguity
    * Same word may change polarity by context.
    * e.g., “unpredictable story” (positive) vs “unpredictable steering” (negative).
3. Multipolarity
    * One text may have mixed sentiments about different aspects.
    * e.g. “The audio quality of my new laptop is so cool but the display colors are not too good.”

**Sentiment Components**

| Element | Description |
|--------|--------|
| Target Object | The entity being evaluated (e.g. iPhone) |
| Attributes | Components (battery) and properties (weight, colour) |
| Attitude Holder | The person expressing opinion |
| Attitude Type | Positive / Negative / Neutral |
| Time | When the sentiment was expressed |

**Sentiment Task Levels**
| Type | Example |
|--------|--------|
| Basic | Positive or Negative |
| Likert Scale | Rank 1-5 |
| Advanced | Detect targets/aspects/emotions (joy, anger, fear, etc.) |

Emotion resources: EmoLex, NRC Twitter Emotion Corpus, SenticNet, EmoSenticNet.

### Evaluation Methods

**Evaluation Metrics**:
* Precision: High when false positives are costly (e.g., spam detection).
* Recall: High when false negatives are costly (e.g., medical diagnosis).
* F1-score: Balances precision and recall.

## Sequential Language Model

### Language Model

A Language Model (LM) predicts the probability of the next word given the previous ones.

e.g. P(here | can, you, come)

### Neural Language Model

**Traditional Neural LM**

Fixed-size input window → cannot capture long dependencies.

**RNN-based LM**
* Processes variable-length input, shares weights across time.
* Learns long-term sequence patterns.
* Can generate text by sampling next words recursively.

## Language Fundamental

| Level | Description | 中文说明 |
|--------|--------|--------|
| Phonology | Study of sounds in a language | 语音学：研究语言的发音规律 |
| Morphology | Study of word formation and morphemes | 词法学：研究词的结构和构成 |
| Syntax | Word order and grammatical structure | 句法学：研究句子的语法结构 |
| Semantics | Meaning of words and combinations | 语义学：研究词义与组合意义 |
| Pragmatics | Meaning in context | 语用学：研究语境中的语言意义 |

![image](/blogs/natural-language-processing-notes/24.png)

## Text Preprocessing

Every NLP task requires text preprocessing.

1.	Tokenisation
	•	Split text into tokens.
	•	Handle multilingual and compound words (German, Japanese, Arabic).
2.	Normalisation
	•	Unify text format (e.g., U.S.A. → USA).
3.	Case Folding
	•	Convert all to lowercase except when case matters (e.g., “US” ≠ “us”).
4.	Lemmatisation （词形还原）
	•	Convert words to dictionary base form using grammar context.
5.	Stemming（词干提取）
	•	Remove affixes crudely; faster but less accurate than lemmatisation.
6.	Sentence Segmentation
	•	Detect sentence boundaries, handle abbreviations like “Dr.”, “Inc.”.
7.	Regular Expressions
	•	Used for token matching and rule-based preprocessing.

**Stemming vs Lemmatisation**
![image](/blogs/natural-language-processing-notes/25.png)

# Lecture 6 Part of Speech Tagging

## Concept

**Part-of-Speech** (PoS) tagging assigns a syntactic category (noun, verb, adjective, etc.) to each word in a sentence.

e.g. Emma has a beautiful flower → NNP VBZ DT JJ NN

---

**Tagging Criteria**
* Distributional criteria: Where can the words occur?
    * For example, nouns can appear with possession: “his car”, ”her idea” 
* Morphological criteria: What form does the word have? (E.g. -tion, -ize). What affixes can it take? (E.g. -s, -ing, -est).
    * ness, -tion, -ity, and -ance tend to indicate nouns. (happiness, exertion, levity, significance).
* Notional(or semantic) criteria: What sort of concept does the word refer to? (E.g. nouns often refer to ‘people, places or things’). More problematic: less useful for us
    * Nouns generally refer to living things (mouse), places (Perth), non-living things (computer), or concepts (marriage).

---

**PoS Tagging Challenges**

Given an input text, tag each word correctly:

`There/ was/ still/ lemonade/ in/ the/ bottle/`

In the above, the **bottle** is a noun, not a verb. The **still** could be an adjective or an adverb.

---

**The purpose of PoS Tagging**

Essential ingredient in natural language applications.

* Useful in and of itself (more than you’d think)
    * Text-to-speech: record, lead
    * Lemmatization: saw[v] see, saw[n] saw
    * Linguistically motivated word clustering
* Useful as a pre-processing step for parsing
* Useful as features to downstream systems.

## Baseline Approaches

### Rule-based Model

Old POS taggers used to work in two stages, based on hand-written rules:
1. The first stage identifies a set of possible POS for each word in the sentence (based on a lexicon), and 
2. the second uses a set of hand-crafted rules in order to select a POS from each of the lists for each word

![image](/blogs/natural-language-processing-notes/26.png)

### Look-up Table Model

![image](/blogs/natural-language-processing-notes/27.png)

### N-Gram Model

![image](/blogs/natural-language-processing-notes/28.png)

![image](/blogs/natural-language-processing-notes/29.png)

## Seq2Seq(N-to-N) Approaches

## Other N-to-N Sequence Tasks

### Named Entity Recognition

### Natural Language Understanding: Slot Tagging

# Lecture 7 Attention

We will introduce 2 key advance NLP topics:

* **Question Answering (QA)** — how machines answer human questions.
* **Attention Mechanism** — how deep learning models learn to “focus” on important information during sequence processing.

## Question Answering

QA is a field combining information retrieval (IR) and NLP, where systems automatically answer human questions written in natural language.

**Type of Questions**

| Type | Example |
|--------|--------|
| Yes/No | Are you a student? |
| Wh- (who, what, where, when, why, how) | When did you get to this lecture? |
| Choice | Which one of these cities is in Australia? |
| Factoid | “Who is the president of France?” — answer exists in text as a short phrase. |

**Key Questions in Building QA systems**
1.	What do the answers look like?
2.	Where can we get the answers from?
3.	What does our training data look like?

## Knowledge-based Question Answering

Convert a natural language question into a logical query that can be executed against a knowledge base (KB) like DBPedia or Freebase.

**Example:**

```
Question: When was Justin Bieber born?
Logical Form: birth-year(Justin Bieber, x)
Answer: 1994
```

**Implementation**
1.	Map question text → logical form (e.g., SQL/SPARQL query).
2.	Execute query in the knowledge base.
3.	Return factual answer.

**Pros and Cons**

✅ Logical Form instead of (direct) answer makes system robust.

✅ Answer independent of question and parsing mechanism.

✅ The answer may be from the trustworthy sources.

❌ Constrained to queriable questions in Database Schema.

❌ Difficult to find the well-structured training dataset.

## IR-based Question Answering (Reading Comprehension)

Find relevant passages from a large corpus (e.g., Wikipedia) → extract answer span.

**Generic Neural Model for Reading Comprehension**
1.	Convert text & question to word vectors.
2.	Encode both using sequence models (LSTM).
3.	Combine question & context via attention.
4.	Predict start and end tokens of answer span.

## Attention

In Seq2Seq models (e.g., translation), the decoder must encode all input info into one vector → information bottleneck problem.

On each decoding step, attention lets the model focus on relevant parts of the input sequence.

---

**How it works?**
1.	Compute attention scores between decoder hidden state (query) and encoder hidden states (values).
2.	Apply softmax to get a distribution.
3.	Compute weighted sum to form context vector.
4.	Concatenate context vector with decoder hidden state to generate next output.

---

**Benefits of Attention**

✅ Solves vanishing gradient problem.

✅ Allows decoder to “look back” directly at the input.

✅ Improves translation & comprehension accuracy.

✅ Provides interpretability — shows where model focuses.

---

**Categories**

| Category | Definition |
|--------|--------|
| Global / Local | Attend to all input states / part of them |
| Self-Attention | Each word attends to other words in same sequence (used in Transformer) |

---
An example of `Self-Attention`:

In reading comprehension, self-attention helps relate current word to previous sentence context — allowing deeper contextual understanding.

---

Another example of `Bi-LSTM + Attention`:

For each question–document pair:
* Encode question and document separately.
* Use attention to connect question representations with document words.
* Predict start and end positions of the answer.

## Question Answering with Attention

Some questions require non-textual context (images, videos).

e.g. Question: “What are sitting in the basket on a bicycle?” Answer: “Dogs.”

## Open-domain (textual) question answering

Uses a Retriever–Reader framework (Chen et al., 2017):
1.	Retriever: fetch top-K relevant passages from large corpus (e.g., Wikipedia).
2.	Reader: apply reading comprehension model to extract answer.

This enables systems like Google Search / ChatGPT to answer any factual question from vast text collections.

![image](/blogs/natural-language-processing-notes/30.png)

# Lecture 8 Transformer

This lecture explains the evolution of Machine Translation (MT) — from Statistical Machine Translation (SMT) to Neural Machine Translation (NMT), and finally to the Transformer model that revolutionised modern NLP. It also introduces the rise of pre-trained language models like BERT and GPT.

## Machine Translation

Translate a sentence from one language (source) into another language (target).

e.g. 生命短暂 → life is short

## Statistical Machine Translation

Learning a probabilistic model from data.

* Translation Model (P(x|y))：ensure fidelity
* Language Model (P(y))：ensure fluency

What is **Alignment**?

![image](/blogs/natural-language-processing-notes/31.png)

## Neural Machine Translation

## Transformer

## The rise of the Pre-trained Model

# Lecture 9 Advanced NLP: Pretrained Models in NLP
...

# Lecture 10 Advanced NLP: Natural Language Generation
...

# Lecture 11 Advanced NLP: GPT
...

# Lecture 12 Course Review and Exam Guide
...
