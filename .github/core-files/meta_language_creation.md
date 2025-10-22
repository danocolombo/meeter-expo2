# Meta Language Creation

## Graph DB Example

Imagine the following graph database prompt without using meta language. It's hard to follow and nothing about it is reusable.

### Example without Meta Language

Create a python module that uses the networkx library to represent the following graph database structure that includes three distinct nodes, each uniquely identified by their numerical IDs: 1, 2, and 3. These nodes represent individuals, and each should be assigned specific properties and a common label for categorization. For the node identified as 1, assign the properties "name" with the value "Alice" and "age" with the value "30". This node should also be labeled as "User". Similarly, for the node identified as 2, assign the properties "name" with the value "Bob" and "age" with the value "25", and label it as "User". For the node identified as 3, assign the properties "name" with the value "Charlie" and "age" with the value "35", and label it as "User". Establish a directed connection labeled "Friend" from the node representing Alice to the node representing Bob. Assign a weight of 5 to this connection, indicating the strength or importance of their friendship. Similarly, create another directed connection labeled "Friend" from Bob's node to Charlie's node, with a weight of 3, suggesting a different level of friendship strength. Ensure that there is a defined path within the graph that connects Alice directly to Charlie, passing through Bob. This path should reflect the sequence of friendships from Alice to Bob and then from Bob to Charlie, illustrating how Alice can indirectly connect to Charlie through their mutual connection to Bob.

### Meta Language Reference

Now let's imagine that we've created a reference for this type of work and it is also shared with our team so that we aren't creating the same syntax or shorthand over and over:

```text
- `Node(ID)` Defines a node with a unique identifier `ID`.
- `Edge(A, B)` Defines a directed edge from node `A` to node `B`.
- `a ! b` Defines a graph with nodes `a` and `b` and an edge between them.
- `Property(Node, Key, Value)` Assigns a property with `Key` and `Value` to a `Node`.
- `Label(Node, LabelName)` Assigns a label `LabelName` to a `Node` for categorization.
- `Connect(A, B, RelationshipType)` Defines a directed relationship of `RelationshipType` from 
node `A` to node `B`.
- `Path(A, ..., Z)` Defines a path through nodes starting at `A` and ending at `Z`.
- `Merge(Node)` Ensures that a `Node` exists; if it does not, it is created.
- `Weight(Edge, Value)` Assigns a weight `Value` to an `Edge`.
```

### Graph Databases with Meta Language Creation

Let's copy that into the chat window along with an easier to read prompt:

```text
Create a python module that uses the networkx library to represent the following: 

Node(1)
Node(2)
Node(3)

Property(Node(1), "name", "Alice")
Property(Node(1), "age", "30")
Property(Node(2), "name", "Bob")
Property(Node(2), "age", "25")
Property(Node(3), "name", "Charlie")
Property(Node(3), "age", "35")

Label(Node(1), "User")
Label(Node(2), "User")
Label(Node(3), "User")

Connect(1, 2, "Friend")
Connect(2, 3, "Friend")

Weight(Edge(1, 2), 5)
Weight(Edge(2, 3), 3)

Path(1, 2, 3)
```

### Graph Database Output

```python
import networkx as nx

# Create a directed graph
G = nx.DiGraph()

# Define nodes
G.add_node(1, name="Alice", age="30", label="User")
G.add_node(2, name="Bob", age="25", label="User")
G.add_node(3, name="Charlie", age="35", label="User")

# Define edges with weights
G.add_edge(1, 2, weight=5, relationship="Friend")
G.add_edge(2, 3, weight=3, relationship="Friend")

# Define a path
path = nx.shortest_path(G, source=1, target=3)

# Print the path
print("Path:", path)
```

### Graph Database Example 02

````
- `Node(ID)` Defines a node with a unique identifier `ID`.
- `Edge(A, B)` Defines a directed edge from node `A` to node `B`.
- `a ! b` Defines a graph with nodes `a` and `b` and an edge between them.
- `Property(Node, Key, Value)` Assigns a property with `Key` and `Value` to a `Node`.
- `Label(Node, LabelName)` Assigns a label `LabelName` to a `Node` for categorization.
- `Connect(A, B, RelationshipType)` Defines a directed relationship of `RelationshipType` from 
node `A` to node `B`.
- `Path(A, ..., Z)` Defines a path through nodes starting at `A` and ending at `Z`.
- `Merge(Node)` Ensures that a `Node` exists; if it does not, it is created.
- `Weight(Edge, Value)` Assigns a weight `Value` to an `Edge`.

First, create a python module that uses the networkx library to represent the following:

```
Users and Posts:
   - `Node(User1)`, `Property(User1, "name", "Alice")`, `Property(User1, "age", 30)`
   - `Node(Post1)`, `Property(Post1, "content", "Hello World!")`, `Property(Post1, "timestamp", "2023-01-01T12:00:00")`

Relationships:
   - `Connect(User1, User2, "friends")`
   - `Connect(User1, Post1, "author")`
   - `Edge(User2, Post1)`, `Label(Edge, "like")`, `Property(Edge, "timestamp", "2023-01-02T15:00:00")`
   - `Edge(User3, Post1)`, `Label(Edge, "comment")`, `Property(Edge, "timestamp", "2023-01-02T16:00:00")`, `Property(Edge, "content", "Great post!")`

Merge and Connects:
   - `Merge(User4)`, `Property(User4, "name", "Dave")`, `Property(User4, "age", 25)`
   - `Node(Post2)`, `Connect(User4, Post2, "author")`, `Property(Post2, "content", "Another day in paradise.")`, `Property(Post2, "timestamp", "2023-01-03T10:00:00")`
   - `User1 ! User4`, `Label(Edge, "friends")`
   - `Path(User1, User2, User3)`
```

Finally, find and print to console the post with the highest number of likes. Print the post's content, the author's name, and the total number of likes.
````

### Using External Reference Files (Caution)

We can try moving our declarative shorthand to a file and simply reference that file. (You can't copy and paste the `#file:` context variable, so you'll have to type that bit out.) However, GitHub Copilot doesn't seem to weigh this information as heavily as when it is included in the prompt itself. And we can't be sure that all important information will be included. We mention it here because clients often try this, but your mileage may vary.

This is especially a problem when we try to "sneak" more information into our input prompt than we're allowed with our context length restrictions, usually when we try to include a large database schema that can include thousands of lines of DDL. If you get an error with a chat prompt that is too big, we can't work around this by moving information to a file and referencing it. The `@workspace` agent will crawl the file looking for relevant context but won't include everything, and this will lead to incomplete or incorrect outputs.

````
Use the #file:graph_db_prompt_syntax.txt as reference syntax.

Create a python module that uses the networkx library to represent the following:

```
Users and Posts:
   - `Node(User1)`, `Property(User1, "name", "Alice")`, `Property(User1, "age", 30)`
   - `Node(Post1)`, `Property(Post1, "content", "Hello World!")`, `Property(Post1, "timestamp", "2023-01-01T12:00:00")`

Relationships:
   - `Connect(User1, User2, "friends")`
   - `Connect(User1, Post1, "author")`
   - `Edge(User2, Post1)`, `Label(Edge, "like")`, `Property(Edge, "timestamp", "2023-01-02T15:00:00")`
   - `Edge(User3, Post1)`, `Label(Edge, "comment")`, `Property(Edge, "timestamp", "2023-01-02T16:00:00")`, `Property(Edge, "content", "Great post!")`

Merge and Connects:
   - `Merge(User4)`, `Property(User4, "name", "Dave")`, `Property(User4, "age", 25)`
   - `Node(Post2)`, `Connect(User4, Post2, "author")`, `Property(Post2, "content", "Another day in paradise.")`, `Property(Post2, "timestamp", "2023-01-03T10:00:00")`
   - `User1 ! User4`, `Label(Edge, "friends")`
   - `Path(User1, User2, User3)`
```

Finally, find and print to console the post with the highest number of likes. Print the post's content, the author's name, and the total number of likes.
````

### Additional Notes on Meta Language Creation

If you try these prompts without the included declarative syntax, GitHub Copilot will often correctly infer your intent anyway. Don't work harder than you need to get your intended output. However, if you're having trouble communicating your intent to generative AI, especially in a reproducible way, this is a great way of "being specific" in your prompt engineering.

---

## Task Iteration with Meta Language

We can also use this as a hack for defining tasks that we may want to use several time with iterating during our session. You may also notice that (often) by including a list of tasks in our prompt that it elicits chain of thought response without having to ask for step-by-step reasoning.

```text
From now on, when I say !iterate I want you to perform the following tasks:
- Review the last output for bugs.
- Review the last output for best practices.
- Review the last output for opportunities to improve naming.
- Ensure that abbreviations are never used for naming.
- Review the last output for opportunities to improve structure.
- Ensure that type hints have been added and are accurate.
- Ensure that all functions are properly documented.
- Ensure the module is properly documented.
- Output new code with the improvements.

Now, create a detailed Python class for matrix factorization tailored for recommendation systems, ensuring it integrates with Pandas for data handling. The class should predict missing entries in a user-item rating matrix and include the following features: user and item biases, global bias, RMSE calculation for performance evaluation, stochastic gradient descent with early stopping based on a convergence threshold, and a method for generating top-n recommendations. The implementation should be efficient, practical, and ready for real-world application.
```

This prompt would be heavy-handed for normal day-to-day prompts. However, if you're generating complicated output, or if your prompt is ambitious in the amount you are trying to generate in a single turn, or you are doing something like security that would benefit from scrutiny, this can be useful.

### Initial Output

Here's what GH Copilot responds with. Note that we didn't have to ask for this chain of thought reasoning.

```text
Sure, let's start by outlining the class in pseudocode:

Define the class MatrixFactorization
Initialize the class with the following parameters: ratings, n_factors, learning_rate, regularization, n_epochs, n_recommendations, convergence_threshold
Define a method fit to train the model using stochastic gradient descent
Define a method predict to predict the missing entries in the user-item rating matrix
Define a method calculate_rmse to calculate the root mean square error for performance evaluation
Define a method recommend to generate top-n recommendations
Define a method early_stopping to stop training when the improvement is less than the convergence threshold

Now, let's implement this in Python:
```

```python
import numpy as np
import pandas as pd

class MatrixFactorization:
    def __init__(self, ratings: pd.DataFrame, n_factors: int = 20, learning_rate: float = 0.01, regularization: float = 0.1, n_epochs: int = 20, n_recommendations: int = 10, convergence_threshold: float = 0.001):
        self.ratings = ratings
        self.n_users, self.n_items = ratings.shape
        self.n_factors = n_factors
        self.learning_rate = learning_rate
        self.regularization = regularization
        self.n_epochs = n_epochs
        self.n_recommendations = n_recommendations
        self.convergence_threshold = convergence_threshold
        self.user_factors = np.random.normal(scale=1./n_factors, size=(self.n_users, self.n_factors))
        self.item_factors = np.random.normal(scale=1./n_factors, size=(self.n_items, self.n_factors))
        self.user_biases = np.zeros(self.n_users)
        self.item_biases = np.zeros(self.n_items)
        self.global_bias = np.mean(self.ratings[np.where(self.ratings != 0)])

    def fit(self):
        for _ in range(self.n_epochs):
            for u in range(self.n_users):
                for i in range(self.n_items):
                    if self.ratings[u, i] > 0:
                        prediction = self.predict(u, i)
                        error = self.ratings[u, i] - prediction
                        self.user_biases[u] += self.learning_rate * (error - self.regularization * self.user_biases[u])
                        self.item_biases[i] += self.learning_rate * (error - self.regularization * self.item_biases[i])
                        self.user_factors[u, :] += self.learning_rate * (error * self.item_factors[i, :] - self.regularization * self.user_factors[u, :])
                        self.item_factors[i, :] += self.learning_rate * (error * self.user_factors[u, :] - self.regularization * self.item_factors[i, :])
            current_rmse = self.calculate_rmse()
            if current_rmse < self.convergence_threshold:
                break

    def predict(self, user: int, item: int) -> float:
        prediction = self.global_bias + self.user_biases[user] + self.item_biases[item] + self.user_factors[user, :].dot(self.item_factors[item, :].T)
        return prediction

    def calculate_rmse(self) -> float:
        xs, ys = self.ratings.nonzero()
        predicted = self.global_bias + self.user_biases[:,np.newaxis] + self.item_biases[np.newaxis,:] + self.user_factors.dot(self.item_factors.T)
        error = 0
        for x, y in zip(xs, ys):
            error += pow(self.ratings[x, y] - predicted[x, y], 2)
        return np.sqrt(error)

    def recommend(self, user: int) -> np.ndarray:
        predictions = self.user_factors[user, :].dot(self.item_factors.T)
        top_n_indices = np.argsort(predictions)[::-1][:self.n_recommendations]
        return top_n_indices
```

#### Next Steps

Now, we'll use `!iterate` to improve the code. Note the improvements that are made in each example. (And any that are missed!) Output isn't deterministic and will vary; this is another reason that iteration can be powerful.

#### Sample Iteration 01

In this example, notice that Copilot decides to refactor the fit() method:

> "The fit method is doing a lot of work. We can refactor the inner loop into a separate method, which will make the code easier to read and test."

##### User

```text
!iterate
```

##### GH Copilot

```text
Let's review the code again according to your requirements:

Review the last output for bugs: The code seems to be correct, but it's hard to be sure without a specific dataset to test it on.
Review the last output for best practices: The code follows Python best practices, including PEP 8 style guide.
Review the last output for opportunities to improve naming: The variable names are clear and descriptive.
Ensure that abbreviations are never used for naming: No abbreviations are used.
Review the last output for opportunities to improve structure: The structure of the code is good, with clear separation of responsibilities among methods.
Ensure that type hints have been added and are accurate: Type hints are present and accurate.
Ensure that all functions are properly documented: The functions are now properly documented with docstrings.
Ensure the module is properly documented: The class now has a docstring explaining its purpose and usage.
The code seems to be in good shape now. However, there's one potential improvement we can make. The fit method is doing a lot of work. We can refactor the inner loop into a separate method, which will make the code easier to read and test.

Here's the improved code:
<...>
```

#### Sample Iteration 02

##### User

```text
!iterate
```

#####

##### GH Copilot

```text
Based on the last output, here are some improvements:

1. The `fit` method can be improved by adding a convergence condition. Currently, it runs for a fixed number of epochs. We can add a condition to stop training when the improvement in RMSE is less than the convergence threshold.
2. The `calculate_rmse` method can be vectorized for efficiency.
3. The naming of `n_factors`, `n_epochs`, and `n_recommendations` can be improved to `num_factors`, `num_epochs`, and `num_recommendations` respectively for clarity.
4. The `recommend` method currently returns item indices
```

##### User

```text
I approve. Implement those recommendations. And ensure that line length is never longer than 80 characters.
```

##### GH Copilot

```text
In this version, the fit method stops training when the improvement in RMSE is less than the convergence threshold. The calculate_rmse method is now vectorized for efficiency. The naming of num_factors, num_epochs, and num_recommendations has been improved for clarity. The recommend method now returns item indices.
```

```python
import numpy as np
import pandas as pd

class MatrixFactorization:
    """
    Matrix Factorization class for recommendation systems.
    """

    def __init__(
        self, 
        ratings: pd.DataFrame, 
        num_factors: int = 100, 
        learning_rate: float = 0.01, 
        regularization: float = 0.1, 
        num_epochs: int = 20, 
        num_recommendations: int = 10, 
        convergence_threshold: float = 0.001
    ):
        """
        Initialize the class with the given parameters.
        """
        self.ratings = ratings
        self.num_users, self.num_items = ratings.shape
        self.num_factors = num_factors
        self.learning_rate = learning_rate
        self.regularization = regularization
        self.num_epochs = num_epochs
        self.num_recommendations = num_recommendations
        self.convergence_threshold = convergence_threshold

    def fit(self):
        """
        Train the model using stochastic gradient descent.
        """
        self.user_biases = np.zeros(self.num_users)
        self.item_biases = np.zeros(self.num_items)
        self.global_bias = np.mean(self.ratings[np.where(self.ratings != 0)])
        self.user_factors = np.random.normal(
            scale=1./self.num_factors, 
            size=(self.num_users, self.num_factors)
        )
        self.item_factors = np.random.normal(
            scale=1./self.num_factors, 
            size=(self.num_items, self.num_factors)
        )

        previous_rmse = np.inf
        for _ in range(self.num_epochs):
            for u in range(self.num_users):
                for i in range(self.num_items):
                    if self.ratings[u, i] > 0:
                        prediction = self.predict(u, i)
                        error = self.ratings[u, i] - prediction

                        self.user_biases[u] += self.learning_rate * (
                            error - self.regularization * self.user_biases[u]
                        )
                        self.item_biases[i] += self.learning_rate * (
                            error - self.regularization * self.item_biases[i]
                        )

                        self.user_factors[u, :] += self.learning_rate * (
                            error * self.item_factors[i, :] - 
                            self.regularization * self.user_factors[u, :]
                        )
                        self.item_factors[i, :] += self.learning_rate * (
                            error * self.user_factors[u, :] - 
                            self.regularization * self.item_factors[i, :]
                        )

            current_rmse = self.calculate_rmse()
            if previous_rmse - current_rmse < self.convergence_threshold:
                break
            previous_rmse = current_rmse

    def predict(self, user: int, item: int) -> float:
        """
        Predict the rating of a user for an item.
        """
        prediction = self.global_bias + self.user_biases[user] + \
            self.item_biases[item] + \
            self.user_factors[user, :].dot(self.item_factors[item, :].T)
        return prediction

    def calculate_rmse(self) -> float:
        """
        Calculate the Root Mean Square Error for the predictions.
        """
        xs, ys = self.ratings.nonzero()
        predicted = self.global_bias + self.user_biases[:,np.newaxis] + \
            self.item_biases[np.newaxis:,] + \
            self.user_factors.dot(self.item_factors.T)
        error = self.ratings[xs, ys] - predicted[xs, ys]
        return np.sqrt(np.mean(error**2))

    def recommend(self, user: int) -> np.ndarray:
        """
        Generate top-n recommendations for a user.
        """
        predictions = self.user_factors[user, :].dot(self.item_factors.T)
        top_n_item_indices = np.argsort(-predictions)[:self.num_recommendations]
        return top_n_item_indices
```

## Combining the Examples

We can combine these examples together. Even a prompt of this length is fine for Copilot. Try copying some code non-confidential code into OpenAI's tokenization demo:  <https://platform.openai.com/tokenizer>. We still have plenty of context to work with. Don't be afraid to include stack traces or log files in your prompts when needed.

```text
From now on, when I say !iterate I want you to perform the following tasks:
- Review the last output for bugs.
- Review the last output for best practices.
- Review the last output for opportunities to improve naming.
- Ensure that abbreviations are never used for naming.
- Review the last output for opportunities to improve structure.
- Ensure that type hints have been added and are accurate.
- Ensure that all functions are properly documented.
- Ensure the module is properly documented.
- Output new code with the improvements.

---

- `Node(ID)` Defines a node with a unique identifier `ID`.
- `Edge(A, B)` Defines a directed edge from node `A` to node `B`.
- `a ! b` Defines a graph with nodes `a` and `b` and an edge between them.
- `Property(Node, Key, Value)` Assigns a property with `Key` and `Value` to a `Node`.
- `Label(Node, LabelName)` Assigns a label `LabelName` to a `Node` for categorization.
- `Connect(A, B, RelationshipType)` Defines a directed relationship of `RelationshipType` from 
node `A` to node `B`.
- `Path(A, ..., Z)` Defines a path through nodes starting at `A` and ending at `Z`.
- `Merge(Node)` Ensures that a `Node` exists; if it does not, it is created.
- `Weight(Edge, Value)` Assigns a weight `Value` to an `Edge`.

---

Create a python module that uses the networkx library to represent the following: 
```text
Node(1)
Node(2)
Node(3)

Property(Node(1), "name", "Alice")
Property(Node(1), "age", "30")
Property(Node(2), "name", "Bob")
Property(Node(2), "age", "25")
Property(Node(3), "name", "Charlie")
Property(Node(3), "age", "35")

Label(Node(1), "User")
Label(Node(2), "User")
Label(Node(3), "User")

Connect(1, 2, "Friend")
Connect(2, 3, "Friend")

Weight(Edge(1, 2), 5)
Weight(Edge(2, 3), 3)

Path(1, 2, 3)
```
