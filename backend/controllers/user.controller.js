import User from "../models/user.model.js";
import Activity from "../models/activity.model.js";
import mongoose from "mongoose";

// Create a new user
export const CreateUser = async (req, res) => {
  try {
    const { name, userId, email, phoneNumber, password, problemId } = req.body;

    const existingUser = await User.findOne({ userId });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    await User.create({
      name,
      userId,
      email,
      phoneNumber,
      password,
      problemId,
    });

    return res.status(201).json({
      message: "User added successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get all users
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('id is : ', id);
    const user = await User.findOne({ _id: id }).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Find user by credentials
export const findUser = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find the user by userId
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    // Return response if the user exists
    return res.status(200).json({
      message: "User exists",
      user_id: user._id.toString(),
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get solved problems for a user
export const getUserSolved = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    console.log('user is : ', user);
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      problems: JSON.stringify(user.problemId),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add a problem to the user's solved list
export const AddProblem = async (req, res) => {
  try {
    const { userId, problemId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || userId !== req.session.user.id) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);

    if (user.problemId.includes(problemId)) {
      return res.status(400).json({
        message: "Problem already solved",
      });
    }

    user.problemId.push(problemId);
    await user.save();

    return res.status(200).json({
      message: "Problem added successfully",
      problems: user.problemId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove a problem from the user's solved list
export const DeleteProblem = async (req, res) => {
  try {
    const { userId, problemId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || userId !== req.session.user.id) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);

    if (!user.problemId.includes(problemId)) {
      return res.status(400).json({
        message: "Problem not solved",
      });
    }

    user.problemId = user.problemId.filter((problem) => problem !== problemId);
    await user.save();

    return res.status(200).json({
      message: "Problem deleted successfully",
      problems: user.problemId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsernames = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "userIds must be a non-empty array" });
    }

    const users = await User.find({ _id: { $in: userIds } }).select('_id username');

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getUserActivity = async (req, res) => {
  try {
    if(!req.session.user) {
      return res.status(401).json({ message: "User not authorized, sign in." });
    }
    const activities = await Activity.find({ userId: req.session.user.id })
      .sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const postUserActivity = async (req, res) => {
  try {
    if(!req.session.user) {
      return res.status(401).json({ message: "User not authorized, sign in." });
    }
    const activity = await Activity.create(req.body);
    res.status(201).json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const clearMentions = async (req, res) => {
  try {
    if(!req.session.user) {
      return res.status(401).json({ message: "User not authorized, sign in." });
    }
    const id = req.session.user.id;
    const user = await User.findByIdAndUpdate(id, { hasMentions: false }).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const LoginUser = async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    // Find the user by userId
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    // Check if the password matches
    if (user.password !== password) {
      return res.status(400).json({
        message: "Incorrect password",
        success: false,
      });
    }

    // Create session for the user
    req.session.user = {
      id: user._id.toString(),
      userId: user.userId,
      name: user.name,
    };

    // Save the session
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(500).json({ message: "Error saving session" });
      }

      console.log('Session after save:', req.session);

      return res.status(200).json({
        message: "User authenticated",
        success: true,
        user_id: user._id.toString()
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout user
export const LogoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Unable to log out",
        success: false,
      });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  });
};