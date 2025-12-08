const capitalizeFirstLetter = ({
  str,
  allCaps = false,
}: {
  str: string;
  allCaps?: boolean;
}) =>
  str.charAt(0).toUpperCase() +
  (allCaps ? str.slice(1).toUpperCase() : str.slice(1).toLowerCase());

export default capitalizeFirstLetter;
