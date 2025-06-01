// ProblemManager class to handle grouping and sorting by difficulty
export class ProblemManager {
  static groupByTopic(problems) {
    const grouped = {};
    
    // Define difficulty levels for sorting
    const difficultyOrder = {
      'Easy': 0,
      'Medium': 1,
      'Hard': 2,
    };

    const topicOrder = ["Arrays", "Stack/Queue", "Two Pointers", "Hashing", "Binary Search", "Dynamic Programming", "Trees", "Graphs"];

    // Initialize grouped object with empty arrays in the correct order
    topicOrder.forEach(topic => {
      grouped[topic] = [];
    });

    // Group problems by their topic name
    problems.forEach((problem) => {
      if (grouped.hasOwnProperty(problem.topic)) {
        grouped[problem.topic].push(problem);
      }
    });

    // Sort problems within each topic based on difficulty
    topicOrder.forEach((topic) => {
      grouped[topic].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    });

    return grouped;
  }
}

// Fetch problems from the API
export const fetchProblems = async (callback = () => { }) => {
    try {
      const response = await fetch('http://localhost:5000/problems', {
        method: "GET", 
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch problems');
        callback();
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
};

// Fetch user problems
export const fetchUserProblems = async (userId) => {
    if(!userId) return;
    try {
      const response = await fetch(`http://localhost:5000/user/getproblems/${userId}`, {
        method: "GET", 
        credentials: "include",
      });
      // console.log('response of user problems : ', await response.json());
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
};