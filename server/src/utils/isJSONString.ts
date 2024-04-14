const isJSONString = (str: string) => {
  try {
    JSON.parse(str);

    return true;
  } catch (err) {
    return false;
  }
};

export default isJSONString;
