import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableImage from "src/components/draggableImage";
import PropTypes from "prop-types";

const DragAndDropImages = ({
  images,
  submitSwitch,
  onDelete,
  showDelete = true,
}) => {
  const swapSeq = (dragIndex, hoverIndex) => {
    const updatedImages = images.map((img, index) => {
      if (index === dragIndex) {
        return {
          ...img,
          seq: images[hoverIndex].seq, // เอา seq ของ hover มาใส่ drag
        };
      }
      if (index === hoverIndex) {
        return {
          ...img,
          seq: images[dragIndex].seq, // เอา seq ของ drag มาใส่ hover
        };
      }
      return img; // ตัวอื่นไม่เปลี่ยน
    });

    submitSwitch(updatedImages);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {images.map((image, index) => (
          <DraggableImage
            key={image.id}
            index={index}
            image={image}
            swapSeq={swapSeq}
            onDelete={onDelete}
            showDelete={showDelete}
          />
        ))}
      </div>
    </DndProvider>
  );
};

DragAndDropImages.propTypes = {
  images: PropTypes.array,
  submitSwitch: PropTypes.func,
  onDelete: PropTypes.func,
  showDelete: PropTypes.bool,
};

export default DragAndDropImages;
