from agent import research

question = input("Ask your research question: ")

answer = research(question)

print("\n--Generated Answer--\n")
print(answer)