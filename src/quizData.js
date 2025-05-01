const quizData = [
    {
        type: "mcq",
        question: "Which data structure is used in the implementation of recursion?",
        options: ["Queue", "Stack", "Linked List", "Tree"],
        answer: "Stack",
        explanation: "Recursion uses the call stack to keep track of function calls.",
        level: 1,
    },
    {
        type: "mcq",
        question: "What is the time complexity of binary search in a sorted array?",
        options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
        answer: "O(log n)",
        explanation: "Binary search divides the array in half each time, leading to logarithmic time complexity.",
        level: 1,
    },
    {
        type: "tf",
        question: "In a min-heap, the largest element is always at the root.",
        answer: "False",
        explanation: "In a min-heap, the smallest element is at the root.",
        level: 1,
    },
    {
        type: "mcq",
        question: "Which algorithm is used to find the shortest path in a weighted graph with non-negative weights?",
        options: ["Prim's Algorithm", "Kruskal's Algorithm", "Dijkstra's Algorithm", "DFS"],
        answer: "Dijkstra's Algorithm",
        explanation: "Dijkstra's algorithm is designed for shortest path finding in graphs with non-negative weights.",
        level: 2,
    },
    {
        type: "tf",
        question: "Merge sort is an example of a divide and conquer algorithm.",
        answer: "True",
        explanation: "Merge sort divides the array, sorts the parts, and merges them, following the divide and conquer paradigm.",
        level: 2,
    }
];

export default quizData;
