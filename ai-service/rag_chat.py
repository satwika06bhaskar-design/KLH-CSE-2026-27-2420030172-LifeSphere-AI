import re

import ollama

from rag_store import search_documents


NOT_FOUND_MESSAGE = (
    "That information was not found in your uploaded documents."
)


def extract_direct_answer(question, context):
    """
    Handle simple factual questions directly from
    the retrieved document context.
    """

    question_lower = question.lower()

    patterns = {
        "policy number": (
            r"policy\s+number\s*[:\-]?\s*"
            r"([A-Za-z0-9\-]+)"
        ),

        "premium": (
            r"premium\s*[:\-]?\s*"
            r"([0-9,]+(?:\.\d+)?)\s*"
            r"(INR|USD|EUR|Rs\.?)?"
        ),

        "provider": (
            r"policy\s+provider\s*[:\-]?\s*(.+)"
        ),

        "expiry date": (
            r"expiry\s+date\s*[:\-]?\s*"
            r"(.+?)(?:\.|\n|$)"
        ),
    }

    for keyword, pattern in patterns.items():

        if keyword in question_lower:

            match = re.search(
                pattern,
                context,
                re.IGNORECASE
            )

            if match:

                value = match.group(1).strip()

                if keyword == "premium":

                    currency = match.group(2)

                    if currency:
                        return (
                            f"The insurance premium is "
                            f"{value} {currency}."
                        )

                    return (
                        f"The insurance premium is "
                        f"{value}."
                    )

                if keyword == "policy number":
                    return (
                        f"The insurance policy number "
                        f"is {value}."
                    )

                if keyword == "provider":
                    return (
                        f"The insurance policy provider "
                        f"is {value}."
                    )

                if keyword == "expiry date":
                    return (
                        f"The insurance policy expires "
                        f"on {value}."
                    )

    return None


def generate_rag_response(question, top_k=3):

    # -----------------------------------------------------
    # 1. Retrieve relevant document chunks
    # -----------------------------------------------------

    results = search_documents(
        question,
        top_k=top_k
    )

    documents = results.get(
        "documents",
        [[]]
    )[0]

    if not documents:
        return NOT_FOUND_MESSAGE

    context = "\n\n".join(documents)

    # -----------------------------------------------------
    # 2. Direct factual extraction
    # -----------------------------------------------------

    direct_answer = extract_direct_answer(
        question,
        context
    )

    if direct_answer:
        return direct_answer

    # -----------------------------------------------------
    # 3. Ask Ollama for general questions
    # -----------------------------------------------------

    prompt = f"""
You are LifeSphere AI.

Answer the user's question using ONLY the
document context below.

DOCUMENT CONTEXT:
{context}

USER QUESTION:
{question}

Rules:

1. Do not invent information.
2. Do not provide information that is not supported
   by the document context.
3. If the answer is clearly present, answer it.
4. If the answer is not present, respond with exactly:

That information was not found in your uploaded documents.

Do not add anything before or after that sentence.

ANSWER:
"""

    response = ollama.chat(
        model="llama3.2:1b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    answer = response["message"]["content"].strip()

    # -----------------------------------------------------
    # 4. Normalize common LLM refusal responses
    # -----------------------------------------------------

    refusal_phrases = [
        "i cannot provide",
        "i can't provide",
        "i don't have information",
        "i do not have information",
        "not mentioned in the document",
        "not provided in the document",
        "cannot be determined from the document",
        "cannot determine from the document",
    ]

    answer_lower = answer.lower()

    for phrase in refusal_phrases:

        if phrase in answer_lower:
            return NOT_FOUND_MESSAGE

    return answer


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    print("\n===== LifeSphere RAG Chat Test =====\n")

    question = input("Ask a question: ").strip()

    if not question:
        print("Please enter a question.")
        raise SystemExit

    results = search_documents(
        question,
        top_k=3
    )

    documents = results.get(
        "documents",
        [[]]
    )[0]

    print(
        "\n===== RETRIEVED DOCUMENT CONTEXT =====\n"
    )

    if documents:

        for index, document in enumerate(
            documents,
            start=1
        ):

            print(f"[Chunk {index}]")
            print(document)
            print("\n-------------------------")

    else:

        print("No relevant document chunks found.")

    print("\nGenerating AI response...\n")

    answer = generate_rag_response(question)

    print("===== AI RESPONSE =====\n")
    print(answer)

    print("\n===== END =====")