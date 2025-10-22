# Iteration and Task Breakdown

This example demonstrates the power and necessity of iteration. Often, especially when providing sufficient detail, instruction, and examples, we obtain the desired output with our first input. On the other end of this spectrum, however, we can ask for output that is beyond the capabilities of today's tooling. For example, asking GitHub Copilot to `@workspace Perform an in-depth code review of this entire repository` is a request that we may be able to ask Artificial General Intelligence one day, but it is not a prompt that will work with today's generative AI.

In between these two extremes, the process of iteration—of evolving our context within a single user session—can be powerful, allowing us to generate output that wasn't possible from a single prompt.

## Requirements

This example uses the dotnet eShop repository (<https://github.com/dotnet/eshop>) and Visual Studio.

Note: replace `#solution` with `@workspace` if you are working in VS Code.

## Description

This solution is too big to be described by `#solution`. For example these prompts fail to provide a satisfactory answer:

- `#solution I'm a dev onboarding to this project. Give me an overview of separation of concerns per project.`
- `#solution  I'm a dev onboarding to this project. Provide an overview of each of the project within this solution.`

Even this simple request fails:

- `#solution Provide a complete list of projects contained in this solution.`

We need to help GH Copilot build the context that it needs.

## Generate project list

Because we can't even get a complete list of projects from a solution of this size, we need to be creative. Let's ask GitHub Copilot to help us generate this information in a programmatic way. Note that this is a "one-shot prompt" where we are providing an example of the desired output. n-shot prompting help communicate intent to the model.

```text
Write a powershell command that outputs every filename from this dir and subdirs that end in .csproj. Only output the file name, don't output the full path, and don't output the file extension, for example:

- Basket.API
- Catalog.API
- ClientApp
```

### Sample project list output

```powershell
Get-ChildItem -Recurse -Filter *.csproj | ForEach-Object { $_.BaseName }
```

---

## Create initial documentation

We can reset the chat session here. Copy and paste the output from the terminal into our next command.

```text
#solution Explain each of the following projects. For example:

# eShop Overview
## Example.Project
### Description

Here's the list of projects to include in the documentation:
Basket.API
Catalog.API
ClientApp
eShop.AppHost
eShop.ServiceDefaults
EventBus
EventBusRabbitMQ
HybridApp
Identity.API
IntegrationEventLogEF
Mobile.Bff.Shopping
Ordering.API
Ordering.Domain
Ordering.Infrastructure
OrderProcessor
PaymentProcessor
WebApp
WebAppComponents
WebhookClient
Webhooks.API
Basket.UnitTests
Catalog.FunctionalTests
ClientApp.UnitTests
Ordering.FunctionalTests
Ordering.UnitTests

Wrap your documentation output in backticks.

```

---

### Document dependencies

Let's update our documentation to include and overview of dependencies for each project.

Through iteration we're building output that exceeds what we could do in a single prompt. Use `Please continue` if output pauses due to context limits. Also, it's often helpful when working with large outputs to copy and paste our previous output into a new session to ensure that no context is dropped.

```text
#solution Update the above markdown to include an overview of the dependencies for each project. For example:

# eShop Overview
## Example.Project
### Description
### Dependencies
- Depends on ___ for ___.
- Communicates with the ___  for ___.
- Uses ___ for building ___.

Examples of what you MIGHT include under Dependencies include but are not limited to:

- Depends on ___ for ___.
- Communicates with the ___  for ___.
- Uses ___ for building ___.

Here's the list of projects to include in the documentation:
Basket.API
Catalog.API
ClientApp
eShop.AppHost
eShop.ServiceDefaults
EventBus
EventBusRabbitMQ
HybridApp
Identity.API
IntegrationEventLogEF
Mobile.Bff.Shopping
Ordering.API
Ordering.Domain
Ordering.Infrastructure
OrderProcessor
PaymentProcessor
WebApp
WebAppComponents
WebhookClient
Webhooks.API
Basket.UnitTests
Catalog.FunctionalTests
ClientApp.UnitTests
Ordering.FunctionalTests
Ordering.UnitTests

Wrap your documentation output in backticks.
```

---

### Describe architecture

```text
#solution Update the above markdown to include an overview of the architecture for each project. For example:

# eShop Overview
## Example.Project
### Description
This project is responsible for...
### Dependencies
### Architecture

Examples of what you MIGHT include under architecture include but are not limited to:

- Implements the ___ pattern.
- Provides interfaces for ___ and ___.
- Uses ___ for building ___.

Here's the list of projects to include in the documentation:
Basket.API
Catalog.API
ClientApp
eShop.AppHost
eShop.ServiceDefaults
EventBus
EventBusRabbitMQ
HybridApp
Identity.API
IntegrationEventLogEF
Mobile.Bff.Shopping
Ordering.API
Ordering.Domain
Ordering.Infrastructure
OrderProcessor
PaymentProcessor
WebApp
WebAppComponents
WebhookClient
Webhooks.API
Basket.UnitTests
Catalog.FunctionalTests
ClientApp.UnitTests
Ordering.FunctionalTests
Ordering.UnitTests

Wrap your documentation output in backticks.
```

---

### Describe key functionality

```text

#solution Update the above markdown to include key functionality for each project. For example:

# eShop Overview
## Example.Project
### Description
### Dependencies
### Architecture
### Key Functionalities
- Functional testing for the ___ service.
- Device flow interaction for identity management.
- Process payments and handle payment-related events.

Examples of what you MIGHT include under key functionality include but are not limited to:

- Functional testing for the ___ service.
- Device flow interaction for identity management.
- Process payments and handle payment-related events.

Here's the list of projects to include in the documentation:
Basket.API
Catalog.API
ClientApp
eShop.AppHost
eShop.ServiceDefaults
EventBus
EventBusRabbitMQ
HybridApp
Identity.API
IntegrationEventLogEF
Mobile.Bff.Shopping
Ordering.API
Ordering.Domain
Ordering.Infrastructure
OrderProcessor
PaymentProcessor
WebApp
WebAppComponents
WebhookClient
Webhooks.API
Basket.UnitTests
Catalog.FunctionalTests
ClientApp.UnitTests
Ordering.FunctionalTests
Ordering.UnitTests

Wrap your documentation output in backticks.
```

---

### Final Output Sample

```text
# eShop Overview

## Basket.API

### Description

The Basket.API project is responsible for managing the shopping basket functionality.

### Dependencies

- Uses Redis for data storage.
- Integrates with RabbitMQ for event handling.

### Architecture

- Implements the microservices architecture.
- Uses ASP.NET Core for building the API.
- Provides interfaces for basket management and event handling.

### Key Functionalities

- Manage shopping baskets.
- Handle basket-related events.
- Store basket data in Redis.

## Catalog.API

### Description

The Catalog.API project handles the product catalog, including product details and inventory management.

### Dependencies

- Integrates with RabbitMQ for event handling.

### Architecture

- Implements the microservices architecture.
- Uses ASP.NET Core for building the API.
- Provides interfaces for product management and inventory control.

### Key Functionalities

- Manage product catalog.
- Handle inventory updates.
- Process catalog-related events.

## ClientApp

### Description

The ClientApp project is the front-end application for the eShop, providing the user interface for customers to interact with the eShop services.

### Dependencies

- Communicates with various backend APIs for data retrieval and operations.

### Architecture

- Implements the single-page application (SPA) architecture.
- Uses React for building the user interface.
- Provides components for user interaction with eShop services.

### Key Functionalities

- Provide user interface for eShop services.
- Interact with backend APIs.
- Display product catalog and manage shopping baskets.

## eShop.AppHost

### Description

The eShop.AppHost project is the main entry point for the eShop application, configuring and starting all necessary services and dependencies.

### Dependencies

- Depends on multiple backend services like Identity.API, Basket.API, Catalog.API, and Ordering.API.

### Architecture

- Implements the microservices architecture.
- Uses ASP.NET Core for hosting the application.
- Configures and starts all necessary services and dependencies.

### Key Functionalities

- Configure and start eShop services.
- Manage service dependencies.
- Host the eShop application.

## eShop.ServiceDefaults

### Description

The eShop.ServiceDefaults project provides common configurations and services that are shared across multiple eShop projects.

### Dependencies

- Provides shared configurations and services to other eShop projects.

### Architecture

- Implements the shared services architecture.
- Provides common configurations and services for other projects.

### Key Functionalities

- Provide shared configurations.
- Offer common services for eShop projects.
- Ensure consistency across services.

## EventBus

### Description

The EventBus project provides an abstraction for event handling, allowing different implementations of event buses to be used interchangeably.

### Dependencies

- Can be implemented using different message brokers like RabbitMQ.

### Architecture

- Implements the event-driven architecture.
- Provides interfaces for event handling and message brokering.

### Key Functionalities

- Abstract event handling.
- Support multiple message brokers.
- Facilitate event-driven communication.

## EventBusRabbitMQ

### Description

The EventBusRabbitMQ project is an implementation of the EventBus abstraction using RabbitMQ as the underlying message broker.

### Dependencies

- Uses RabbitMQ for message brokering.

### Architecture

- Implements the event-driven architecture.
- Uses RabbitMQ for handling events and messages.

### Key Functionalities

- Implement EventBus using RabbitMQ.
- Handle events and messages.
- Ensure reliable message brokering.

## HybridApp

### Description

The HybridApp project is a hybrid mobile application for the eShop, providing a mobile interface for customers.

### Dependencies

- Communicates with various backend APIs for data retrieval and operations.

### Architecture

- Implements the hybrid mobile application architecture.
- Uses Ionic for building the mobile interface.
- Provides components for user interaction with eShop services.

### Key Functionalities

- Provide mobile interface for eShop services.
- Interact with backend APIs.
- Display product catalog and manage shopping baskets.

## Identity.API

### Description

The Identity.API project handles authentication and authorization, managing user identities and access control.

### Dependencies

- Uses IdentityServer for managing user identities and access control.

### Architecture

- Implements the microservices architecture.
- Uses ASP.NET Core for building the API.
- Provides interfaces for authentication and authorization.

### Key Functionalities

- Manage user identities.
- Handle authentication and authorization.
- Integrate with IdentityServer.

## IntegrationEventLogEF

### Description

The IntegrationEventLogEF project provides an implementation for logging integration events using Entity Framework.

### Dependencies

- Uses Entity Framework for data access and logging.

### Architecture

- Implements the event-driven architecture.
- Uses Entity Framework for logging integration events.

### Key Functionalities

- Log integration events.
- Use Entity Framework for data access.
- Ensure reliable event logging.

## Mobile.Bff.Shopping

### Description

The Mobile.Bff.Shopping project acts as a backend-for-frontend (BFF) for the mobile shopping application, aggregating and orchestrating calls to various backend services.

### Dependencies

- Aggregates and orchestrates calls to backend services like Basket.API, Catalog.API, and Ordering.API.

### Architecture

- Implements the backend-for-frontend (BFF) architecture.
- Uses ASP.NET Core for building the BFF.
- Provides interfaces for aggregating and orchestrating backend service calls.

### Key Functionalities

- Aggregate backend service calls.
- Orchestrate interactions with backend services.
- Provide a unified API for mobile clients.

## Ordering.API

### Description

The Ordering.API project manages the order processing functionality, including order creation, validation, and status updates.

### Dependencies

- Integrates with RabbitMQ for event handling.
- Uses a database for order data storage.

### Architecture

- Implements the microservices architecture.
- Uses ASP.NET Core for building the API.
- Provides interfaces for order management and event handling.

### Key Functionalities

- Manage order processing.
- Handle order-related events.
- Store order data in a database.

## Ordering.Domain

### Description

The Ordering.Domain project contains the domain logic and entities for the ordering system, following the domain-driven design principles.

### Dependencies

- Provides domain logic and entities to Ordering.API and Ordering.Infrastructure.

### Architecture

- Implements the domain-driven design (DDD) architecture.
- Provides domain entities and logic for the ordering system.

### Key Functionalities

- Define domain entities.
- Implement domain logic.
- Support order processing.

## Ordering.Infrastructure

### Description

The Ordering.Infrastructure project provides the data access layer for the ordering system, including repositories and database context.

### Dependencies

- Uses Entity Framework for data access.
- Depends on Ordering.Domain for domain entities and logic.

### Architecture

- Implements the repository pattern.
- Uses Entity Framework for data access and database context.

### Key Functionalities

- Provide data access layer.
- Implement repositories.
- Use Entity Framework for database context.

## OrderProcessor

### Description

The OrderProcessor project handles background processing of orders, such as payment processing and order fulfillment.

### Dependencies

- Integrates with RabbitMQ for event handling.
- Communicates with external payment gateways for payment processing.

### Architecture

- Implements the background processing architecture.
- Uses RabbitMQ for handling events and messages.
- Provides interfaces for payment processing and order fulfillment.

### Key Functionalities

- Process payments.
- Handle order fulfillment.
- Manage background order processing.

## PaymentProcessor

### Description

The PaymentProcessor project manages payment processing, integrating with external payment gateways to handle transactions.

### Dependencies

- Integrates with external payment gateways for handling transactions.

### Architecture

- Implements the microservices architecture.
- Uses ASP.NET Core for building the API.
- Provides interfaces for payment processing and transaction handling.

### Key Functionalities

- Process payments.
- Handle payment-related events.
- Integrate with external payment gateways.

## WebApp

### Description

The WebApp project is the main web application for the eShop, providing the user interface for customers to interact with the eShop services.

### Dependencies

- Communicates with various backend APIs for data retrieval and operations.

### Architecture

- Implements the single-page application (SPA) architecture.
- Uses React for building the user interface.
- Provides components for user interaction with eShop services.

### Key Functionalities

- Provide user interface for eShop services.
- Interact with backend APIs.
- Display product catalog and manage shopping baskets.

## WebAppComponents

### Description

The WebAppComponents project contains reusable components and services for the WebApp, promoting modularity and code reuse.

### Dependencies

- Provides reusable components and services to WebApp.

### Architecture

- Implements the component-based architecture.
- Provides reusable components and services for the WebApp.

### Key Functionalities

- Provide reusable components.
- Offer common services for WebApp.
- Promote code reuse and modularity.

## WebhookClient

### Description

The WebhookClient project handles webhook subscriptions and notifications, allowing external systems to receive updates from the eShop.

### Dependencies

- Communicates with Webhooks.API for managing webhook subscriptions and notifications.

### Architecture

- Implements the event-driven architecture.
- Provides interfaces for managing webhook subscriptions and notifications.

### Key Functionalities

- Manage webhook subscriptions.
- Send notifications to external systems.
- Integrate with Webhooks.API.

## Webhooks.API

### Description

The Webhooks.API project provides an API for managing webhook subscriptions and sending notifications to subscribed clients.

### Dependencies

- Uses a database for storing webhook subscriptions.
- Integrates with RabbitMQ for event handling.

### Architecture

- Implements the microservices architecture.
- Uses ASP.NET Core for building the API.
- Provides interfaces for managing webhook subscriptions and notifications.

### Key Functionalities

- Manage webhook subscriptions.
- Send notifications to clients.
- Store subscription data in a database.

## Basket.UnitTests

### Description

The Basket.UnitTests project contains unit tests for the Basket.API project, ensuring the correctness of the basket functionality.

### Dependencies

- Depends on Basket.API for testing its functionality.

### Architecture

- Implements the unit testing architecture.
- Uses xUnit for writing unit tests.

### Key Functionalities

- Test basket management functionality.
- Ensure correctness of basket operations.
- Use xUnit for unit testing.

## Catalog.FunctionalTests

### Description

The Catalog.FunctionalTests project contains functional tests for the Catalog.API project, verifying the end-to-end behavior of the catalog functionality.

### Dependencies

- Depends on Catalog.API for testing its functionality.

### Architecture

- Implements the functional testing architecture.
- Uses xUnit for writing functional tests.

### Key Functionalities

- Test end-to-end catalog functionality.
- Verify product management and inventory control.
- Use xUnit for functional testing.

## ClientApp.UnitTests

### Description

The ClientApp.UnitTests project contains unit tests for the ClientApp project, ensuring the correctness of the front-end application.

### Dependencies

- Depends on ClientApp for testing its functionality.

### Architecture

- Implements the unit testing architecture.
- Uses Jest for writing unit tests.

### Key Functionalities

- Test front-end components.
- Ensure correctness of user interface.
- Use Jest for unit testing.

## Ordering.FunctionalTests

### Description

The Ordering.FunctionalTests project contains functional tests for the Ordering.API project, verifying the end-to-end behavior of the ordering functionality.

### Dependencies

- Depends on Ordering.API for testing its functionality.

### Architecture

- Implements the functional testing architecture.
- Uses xUnit for writing functional tests.

### Key Functionalities

- Test end-to-end ordering functionality.
- Verify order processing and status updates.
- Use xUnit for functional testing.

## Ordering.UnitTests

### Description

The Ordering.UnitTests project contains unit tests for the Ordering.API project, ensuring the correctness of the order processing functionality.

### Dependencies

- Depends on Ordering.API for testing its functionality.

### Architecture

- Implements the unit testing architecture.
- Uses xUnit for writing unit tests.

### Key Functionalities

- Test order processing functionality.
- Ensure correctness of order operations.
- Use xUnit for unit testing.
```

---

## Conclusion

Iteration incorporates previous output into our next prompt. We're not starting from scratch with each prompt. Iteration  allows us to build on what we've already established to generate more detail or a more accurate output.

Continue to iterate as needed to build out documentation. As the amount of documentation grows, it will become beneficial to switch to documenting a a few projects or a single project at a time. However, in that case, it is still useful to include some high-level documentation with the prompt to improve GH Copilot's understanding.
