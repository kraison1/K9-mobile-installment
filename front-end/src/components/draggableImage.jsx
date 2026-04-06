import { useDrag, useDrop } from "react-dnd";
import PropTypes from "prop-types";

const DraggableImage = ({ image, index, swapSeq, onDelete, showDelete }) => {
  const [, ref] = useDrag({
    type: "div",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "div",
    drop: (draggedItem) => {
      if (draggedItem.index !== index) {
        swapSeq(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drop(ref(node))}
      className="justify-center border p-2 relative"
      style={{ cursor: "move", position: "relative" }}
    >
      {index != 0 && showDelete ? (
        <button
          type="button"
          onClick={() => onDelete(image)}
          className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1"
          style={{ zIndex: 10 }}
        >
          ✕
        </button>
      ) : null}
      <a
        href={`${import.meta.env.VITE_APP_API_URL}/${image?.name}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          textAlign: "-webkit-center",
        }}
      >
        <img
          src={`${import.meta.env.VITE_APP_API_URL}/${image?.name}`}
          style={{
            width: 180,
            height: 120,
          }}
          alt={import.meta.env.VITE_APP_NAME}
        />
      </a>
    </div>
  );
};

DraggableImage.propTypes = {
  image: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  swapSeq: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  showDelete: PropTypes.bool.isRequired,
};

export default DraggableImage;
