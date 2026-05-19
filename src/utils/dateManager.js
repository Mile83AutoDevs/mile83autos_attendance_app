const dateManager = (type = "") => {
  switch (type) {
    case "date":
      return new Date().toLocaleDateString("en-CA");
    case "time":
      return new Date().toLocaleTimeString();
  }
};

export default dateManager;
