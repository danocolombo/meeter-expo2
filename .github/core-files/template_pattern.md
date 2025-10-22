# Template Pattern

## Data Model Example

Copy the entire prompt below into Copilot and let's see if it can create a data class based on the JSON data. Note that we're using more instructions here than with the comparable n-shot example.

### Data Model Prompt

Whenever you create a data class, use the following template. Text that is in all caps and brackets is a placeholder for your output: `[EXAMPLE]` Use your best judgement for required output that doesn't fit into the template. Note spacing. Always use `LIST` and `ILIST<T>` instead of arrays.

When writing class descriptions, avoid prepositional phrases in class descriptions:
BAD: Gets or sets the attributes of the data.
GOOD: Gets or sets the data attributes.

Here is the class template:

```csharp
using Newtonsoft.Json;
  using System.Collections.Generic

{
    /// <summary>
    ///     [SUMMARY OF THE CLASS]
    /// </summary>
    public class [CLASS NAME]
    {
        /// <summary>
        ///     Gets or sets the [DESCRIPTION OF THE PROPERTY].
        /// </summary>
        [JsonProperty("propertyNameInCamelCase")]
        public int [PropertyNameInPascalCase] { get; set; }

        /// <summary>
        ///     Gets or sets the list of [DESCRIPTION OF THE LIST].
        /// </summary>
        public IList<[TYPE]> [PropertyNameInPascalCase]List { get; set; } = new List<[TYPE]>();

        // Optional: Add a constructor if needed
        public [CLASS NAME]()
        {
            // Initialization of properties if necessary
        }
    }
}
```

Now, create a data class to hold this information:

```json
{
  "data": [{
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "Prompt engineering is easy!",
      "body": "Words, words, words."
    },
    "relationships": {
      "author": {
        "data": {"id": "3542", "type": "people"}
      }
    }
  }],
  "included": [
    {
      "type": "people",
      "id": "3542",
      "attributes": {
        "name": "Michelle"
      }
    }
  ]
}
```

⚠️ Note that this use case is too heavy-handed for generative AI because simply providing an example will produce the same result. (See n-shot prompting.md.) We restrict the ability of generative AI to adapt to our specific needs and context. When we don't need a template, and/or when providing example code would suffice, it's a waste of time to go through the effort of creating one.

However, in cases where output can vary widely, such as constraining natural language output or creating markdown to a specific format, we may want to use a template. Code reviews could also be an example of this, where we may want to specify topics and practices that are important to our team or project. Generating markdown documentation with very specific layouts and information could be another.

## Code Review Example

Open one of the classes under `./WrightBrothersApi/Controllers` on which we'll perform a code review.

With regards to delineating the file for model comprehension, we often use triple backticks for input and output. However, we want to avoid outputting in markdown in this case so that it is easier to read the code review in the IDE. Using three dashes `---` would render as a line in the GitHub Copilot chat interface. Therefore, we've used syntax like `<BeginOutputExample>`.

This is a rough idea of what you may want your code review prompt to resemble. Leverage the ability of generative AI to adapt its output to your needs and preferences to build a prompt specific to your project or team.

### Using Multiple Prompts

Remember that we can ask generative AI to do too much in a single prompt, so consider using multiple review prompts if you are attempting a complex or detailed review. You may want to use multiple prompts that span multiple personas. (See the `persona.md` example.)

### Code Review Prompt

```text
@workspace As a lead developer review this file for the following:

Data validation
Logging
Proper error handling
Security (Authentication, Authorization, etc.)
Testing
Documentation
Performance
Code Readability and Maintainability

For any category that makes best pratices output "✅ Looks good!"

For any category that isn't applicable output "✅ N/A"

The following is an example of output:

<BeginOutputExample>

## Data validation
`[ImprovementTopicName]`: `[Details]`

## Logging
`[ImprovementTopicName]`: `[Details]`

## Proper error handling
`[ImprovementTopicName]`: `[Details]`

## Security
✅ N/A

## Testing
✅ Looks good!

## Documentation
[ImprovementTopicName]: [Details]

## Performance
[ImprovementTopicName]: [Details]

## Code Readability and Maintainability
[ImprovementTopicName]: [Details]

<EndOutputExample>

Additional instructions:
- `[ImprovementTopicName]` is the name of the topic that you should provide.
- There can be more than one `[ImprovementTopicName]` per category as required.
- `[Details]` are the topic details that you should provide.
- Don't use markdown headers for improvement topics.
- You are an empathetic code reviewer. Encourage developers during the code review and communicate each recommendation compassionately as an opportunity to improve. Temper recommendations by also highlighting something related that they did well, when possible. Here is an example of a recommendation for testing, "Test coverage for edge cases: Your testing setup in PlanesControllerTests is off to a great start! To make it even better, consider adding tests for edge cases, such as attempting to retrieve a plane with an ID that doesn't exist or adding a plane with invalid data. This will help ensure your application behaves as expected in a wider range of scenarios."
- Never include an output summary.

```
