const Recognition = require("../models/Recognition");

exports.getRecognitions = async (req, res) => {
  try {
    const data = await Recognition.find().sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRecognition = async (req, res) => {
  try {
    const item = await Recognition.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRecognition = async (req, res) => {
  try {
    const item = await Recognition.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRecognition = async (req, res) => {
  try {
    await Recognition.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
