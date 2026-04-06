import PropTypes from "prop-types";

const HorizontalRule = ({ color = "gray-300", margin = "my-4" }) => {
  return <hr className={`border-t border-${color} ${margin}`} />;
};

HorizontalRule.propTypes = {
  color: PropTypes.string,
  margin: PropTypes.string,
};

export default HorizontalRule;
