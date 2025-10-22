# Persona Pattern

Let's compare an identical prompt using different personas.

Open the `PlanesController.cs` file under `WrightBrothersApi/Controllers` and ask GitHub Copilot to perform a code review.

## Lead Developer

```text
@workspace As a lead developer describe opportunities or potential improvements for  this file or respond, "Looks good!"
```

## Security Analyst

```text
@workspace As a security analyst describe opportunities or potential improvements for  this file or respond, "Looks good!"
```

## Data Scientist

```text
@workspace As a data scientist describe opportunities or potential improvements for  this file or respond, "Looks good!"
```

### Refinements

#### Encouraging Code Reviewer

```text
@workspace As a compassionate and encouraging lead developer, describe opportunities or potential improvements for this file or respond, "This looks good!" For each improvement, take a moment to explain, as a mentor, the subtleties and details of what should be done and why it should be done. Infuse your feedback with encouragement where possible.
```

#### Opinionated Code Reviewer

```text
@workspace As an opinionated and blunt lead developer, describe problems or potential improvements for this file -- or respond, "This looks good!" For each improvement, take a moment to explain, as a mentor, the subtleties and details of what should be done and why it should be done.
```

## Hallucinations

Note in the prompt above that we give the model the option not to respond. We can sometimes reduce the potential for hallucinations by allowing the model a higher probability output when it would otherwise need to generate low-quality output.

Consider the output of this prompt:

```text
List 5 things wrong with this line of code:
`print("Hello World.")`
```

And contrast with this where we allow the model not to review code where it isn't necessary.

```text
List 5 things wrong with this line of code or say, "Looks good!":
`print("Hello World.")`
```
