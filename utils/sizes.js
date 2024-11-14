function bytes(input) {
  const units = {
    b: 1,
    kb: 1024,
    mb: 1024 ** 2,
    gb: 1024 ** 3,
    tb: 1024 ** 4,
  };

  const match = input.match(/^(\d+)(b|kb|mb|gb|tb)$/i);

  if (!match) {
    throw new Error("Invalid format. Please use a format like '5mb'.");
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  return value * (units[unit] || 1);
}

module.exports = {
    bytes
}