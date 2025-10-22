# Cognitive Verifier

Enhance the accuracy and relevance of responses by subdividing a question into additional questions.

## Secure Password Storage Example

### Turn One

```text
From now on, whenever I ask a question, ask three additional questions that would help you produce a better version of the original question and then use those answers to output a better version of that question.

How can I securely store passwords?
```

### Turn Two

```text
We're using python. This is a backend service. We need to adhere to OWASP PBKDF2.
```

We can initiate a fresh round of questioning:

```text
From now on, whenever I ask a question, ask three additional questions that would help you produce a better version of the original question and then use those answers to output a better version of that question.

How can I securely store passwords in a Python backend service that adheres to the AWASP Application Security Verification Standard v4 and NIST 5.1.1.2.

```

But note that When the refinement questions get too specific, that's a good place to stop with this pattern.

```text
Create a backend service in Python that securely store passwords for a web and mobile application that adheres to the AWASP Application Security Verification Standard v4 and NIST 5.1.1.2, using MS SQL on Azure for storage and bcrypt for password security.
```

Consider continuing with another pattern like the Persona Pattern.

```text
You are a security analyst. Review and improve this module for security best practices.
```

## Serverless REST API Example

You can also use a variant of this to explore and drill down into architecture. Let's say you want to create a serverless REST API in Azure using C#.

### First User Turn

```text
From now on, I would like you to ask me questions to create a serverless REST API in Azure using C#.
```

### First Output Sample

```text
- Have you already set up an Azure account?
- Do you have the Azure Functions Core tools installed on your machine?
- Do you have a specific data storage preference for your API (e.g., Azure SQL Database, Cosmos DB)?
- What endpoints will your API have and what will each endpoint do?
- Will your API require authentication? If so, what kind of authentication will you be using?
- Do you have a preferred testing framework for your API?
- Will you be implementing CI/CD for this API? If so, have you decided on a tool (e.g., Azure DevOps, GitHub Actions)?
- Do you have a plan for monitoring and logging? Azure provides built-in services like Application Insights and Log - Analytics.
- How do you plan to handle error and exception handling in your API?
```

### Second User Turn

Here's an example of what we might include on the next user turn.

```text
From now on, I would like you to ask me questions to create a serverless REST API to Azure using C#. We already know the following information. Ask follow-up questions or additional questions.

Have you already set up an Azure account?
Yes

Do you have the Azure Functions Core tools installed on your machine?
Yes

Do you have a specific data storage preference for your API (e.g., Azure SQL Database, Cosmos DB)?
Cosmos DB

What endpoints will your API have and what will each endpoint do?
The /GET will return the current weather from Cosmos DB based on zip code.

 Will your API require authentication? If so, what kind of authentication will you be using?
 Yes, it will be using Azure B2C.

Do you have a preferred testing framework for your API?
XUnit

Will you be implementing CI/CD for this API? If so, have you decided on a tool (e.g., Azure DevOps, GitHub Actions)?
GitHub Actions

Do you have a plan for monitoring and logging? Azure provides built-in services like Application Insights and Log Analytics.
Both Application Insights and Log Analytics with Azure Monitor.

How do you plan to handle error and exception handling in your API?
Built-in exception handling in Azure Functions and Rollbar
```

### Second Output Sample

```text
- Do you have an existing Cosmos DB instance or do you need to create a new one?
- What is the structure of the data in Cosmos DB that the /GET endpoint will be retrieving?
- Will the /GET endpoint need to support any query parameters other than zip code?
- For Azure B2C, do you already have a tenant set up or will you need to create one?
- What kind of roles and permissions will you need to set up in Azure B2C for your API?
- Are there any specific XUnit features or practices you plan to use for testing your API?
- What specific workflows do you plan to set up in GitHub Actions for your CI/CD pipeline?
- How do you plan to configure Application Insights and Log Analytics for your API?
- How will you use Rollbar in conjunction with Azure Functions' built-in exception handling?
- Do you have a plan for how to handle potential downtime or other issues with your API?
```

## Question Refinement

A similar but simpler pattern exists called Question Refinement. This can sometimes be used as a follow-up to Cognitive Verifier but tends to be of low value. In this pattern, we ask the LLM to suggest a better version of the question without breaking it apart as we do with the Cognitive Verifier pattern.

## Core Example

When a requirement or query is presented, suggest a better version of the question.

### Prompt

How do I create an API?
How do I create a REST API?
How do I create a REST API using Flask?
How can I create an API using Flask that responds to GET requests?
How can I create an API using Flask that responds to GET requests and serves weather content from Cosmos DB?
How can I create an API using Flask that responds to GET requests and serves weather content from Cosmos DB based on the user's zip code?
