# Reflection Prompt Pattern

The Reflection Prompt Pattern asks the model to explain the reasoning behind the code it generates. Or intent with this pattern is to surface the model's logic, assumptions, and potential biases. This allows us to validate the approach or to iterate on our prompt with better instructions. It improves our ability to trust the model's output. And it can help us learn as well.

## Sorting Example

```text
Description:
You are tasked with generating Python code for a data processing scenario involving a large-scale simulation. This simulation produces a massive dataset containing billions of 32-bit unsigned integer timestamps, each representing a unique event in the simulation.

Use Case:
The dataset needs to be sorted by these timestamps to prepare it for further analysis, such as plotting changes in a simulated parameter over time. The dataset is too large to fit comfortably in memory, and you must ensure the sorting process is as efficient as possible. Given the nature of the data—specifically that all timestamps are 32-bit unsigned integers, uniformly distributed across a large range—it's crucial to select the most appropriate sorting algorithm.

Requirements:
    Efficiency: The sorting algorithm should handle the massive scale of the dataset efficiently, minimizing time complexity and resource usage.
    Scalability: The solution should be scalable, capable of processing datasets that might grow even larger in future simulations.
    Uniform Data Structure: Consider that the data consists exclusively of 32-bit integers, and the range of these integers is uniformly distributed.

Instructions:
 Generate the Python code that implements the sorting algorithm and provide an explanation of why the chosen algorithm is optimal for this scenario, including both its time and space complexity, and give an explanation of any additional assumptions you've made about the data if any.
```

Note: We're looking for a Radix sort here, with a time complexity of $O(n \cdot k)$.

## Neural Network Example

```text
Description:
You are tasked with generating Python code to build, train, and evaluate a machine learning model for image classification. The dataset contains millions of labeled images of varying resolutions. Given the large size of the dataset and the need for high accuracy, you must choose an appropriate model architecture, preprocessing techniques, and training procedure.

Requirements:
    Accuracy: The model should be capable of achieving high classification accuracy.
    Efficiency: Training time and resource usage should be optimized, given the large dataset size.
    Scalability: The solution should be scalable to handle potentially even larger datasets in the future.
    Data Characteristics: Consider the varying resolutions of the images in the dataset.

Instructions:
    Generate the Python code for the machine learning pipeline, including model selection, data preprocessing, training, and evaluation.
    Reflect on the decisions you make, explaining why each step or technique is chosen and how it meets the requirements of the task. When choosing a framework or library, reflect on what that decision was the correct choice.
```

Assuming that GitHub Copilot chooses TensorFlow, we can following with a prompt asking for a detailed comparison of other frameworks that helps us to validate the approach.

```text
Explain your choice of Tensorflow over PyTorch and JAX and including a pros/cons table of each. If necessary, reconsider the framework choice or say, "Tensorflow is still preferred."
```
