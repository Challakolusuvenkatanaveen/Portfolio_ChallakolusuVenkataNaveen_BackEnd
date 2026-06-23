const Menu = require("../models/Menu");

exports.getMenus = async (req, res) => {
  try {
    const menus = await Menu.find().sort({ order: 1, createdAt: 1 });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const menu = await Menu.create(req.body);
    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Menu deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
