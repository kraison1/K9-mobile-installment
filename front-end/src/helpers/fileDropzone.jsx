import { useDropzone } from "react-dropzone";
import PropTypes from "prop-types";
import { error } from "src/components/alart";
import { Controller } from "react-hook-form";
import imageCompression from "browser-image-compression";
import React, { useState, useCallback } from "react";
import { useAuth } from "src/hooks/authContext";

const FileDropzone = ({
  name,
  acceptedFileTypes,
  control,
  maxFileSize = 5,
  fileMultiple,
  setValue,
  isOpen,
}) => {
  const { setIsLoadingOpen } = useAuth();
  const [fileList, setFileList] = useState([]);
  const [compressionProgress, setCompressionProgress] = useState(0);

  // Limit concurrency to avoid overwhelming the browser
  const processWithConcurrency = async (items, fn, limit = 3) => {
    const results = [];
    for (let i = 0; i < items.length; i += limit) {
      const chunk = items.slice(i, i + limit);
      const chunkResults = await Promise.all(chunk.map(fn));
      results.push(...chunkResults);
      setCompressionProgress(Math.min(((i + limit) / items.length) * 100, 100));
    }
    return results;
  };

  const compressImage = async (file) => {
    if (!file.type.startsWith("image/")) {
      return {
        name: file.name,
        size: file.size,
        status: "accepted",
        file,
      };
    }

    const options = {
      maxSizeMB: 2,
      maxWidth: 800,
      maxHeight: 600,
      useWebWorker: true,
      initialQuality: 0.6,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return {
        name: compressedFile.name,
        size: compressedFile.size,
        status: "accepted",
        file: compressedFile,
      };
    } catch (err) {
      error(`เกิดข้อผิดพลาดในการบีบอัดรูปภาพ: ${err.message}`);
      return {
        name: file.name,
        size: file.size,
        status: "rejected",
        errors: [err.message],
      };
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles, fileRejections) => {
      setIsLoadingOpen(true);
      setCompressionProgress(0);

      try {
        const acceptedFileList = await processWithConcurrency(
          acceptedFiles,
          compressImage,
          3
        );

        const rejectedFileList = fileRejections.map(({ file, errors }) => ({
          name: file.name,
          size: file.size,
          status: "rejected",
          errors: errors.map((e) => e.message),
        }));

        setFileList([...acceptedFileList, ...rejectedFileList]);

        if (fileMultiple) {
          setValue(
            name,
            acceptedFileList
              .filter((file) => file.status === "accepted")
              .map((file) => file.file),
            { shouldValidate: true }
          );
        } else {
          if (
            acceptedFileList.length > 0 &&
            acceptedFileList[0].status === "accepted"
          ) {
            setValue(name, acceptedFileList[0].file, { shouldValidate: true });
          }
        }

        if (fileRejections.length > 0) {
          const errorMessage = fileRejections
            .map(
              ({ file, errors }) =>
                `${file.name}: ${errors.map((e) => e.message).join(", ")}`
            )
            .join("\n");
          error(errorMessage);
        }
      } catch (err) {
        error(`เกิดข้อผิดพลาดในการประมวลผลไฟล์: ${err.message}`);
      } finally {
        setCompressionProgress(0);
        setIsLoadingOpen(false);
      }
    },
    [name, fileMultiple, setValue, setIsLoadingOpen]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedFileTypes,
    multiple: fileMultiple,
    maxSize: 1024 * 1024 * maxFileSize,
    onDrop,
  });

  // ฟังก์ชันลบไฟล์
  const handleDelete = (indexToDelete) => {
    // กรองไฟล์ที่ไม่ใช่ index ที่ต้องการลบ
    const updatedFileList = fileList.filter(
      (_, index) => index !== indexToDelete
    );
    setFileList(updatedFileList);

    // อัปเดตค่าในฟอร์ม
    if (fileMultiple) {
      const updatedFiles = updatedFileList
        .filter((file) => file.status === "accepted")
        .map((file) => file.file);
      setValue(name, updatedFiles, { shouldValidate: true });
    } else {
      const acceptedFile = updatedFileList.find(
        (file) => file.status === "accepted"
      );
      setValue(name, acceptedFile ? acceptedFile.file : null, {
        shouldValidate: true,
      });
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setFileList([]);
      setValue(name, null);
    }
  }, [isOpen, name, setValue]);

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: false }}
      render={({ field: { onChange, onBlur, value } }) => {
        React.useEffect(() => {
          if (!value || value.length === 0) {
            setFileList([]);
          }
        }, [value]);
        return (
          <div>
            <div
              {...getRootProps()}
              className="dropzone p-4 border-dashed border-2 border-gray-300 text-center"
            >
              <input
                {...getInputProps({
                  onBlur,
                  onChange: (event) => {
                    onChange(event.currentTarget.files[0]);
                  },
                })}
              />
              {isDragActive ? (
                <p>วางไฟล์มาไว้ตรงนี้ ...</p>
              ) : (
                <p>คลิกเพื่ออัพโหลดไฟล์หรือลากไฟล์มาไว้ตรงนี้</p>
              )}
            </div>
            {compressionProgress > 0 && (
              <div className="progress mt-2">
                <div
                  className="progress-bar"
                  style={{ width: `${compressionProgress}%` }}
                >
                  กำลังบีบอัด: {Math.round(compressionProgress)}%
                </div>
              </div>
            )}
            {fileList.length > 0 ? (
              <div className="file-list mt-4">
                <h4>ไฟล์ที่อัพโหลด:</h4>
                <ul>
                  {fileList.map((file, index) => (
                    <li
                      key={index}
                      className={
                        file.status === "rejected"
                          ? "text-red-500"
                          : "text-green-500"
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {/* Thumbnail สำหรับไฟล์รูปภาพ */}
                      {file.status === "accepted" &&
                        file.file.type.startsWith("image/") && (
                          <a
                            href={URL.createObjectURL(file.file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              const url = e.currentTarget.href;
                              setTimeout(() => URL.revokeObjectURL(url), 100);
                            }}
                          >
                            <img
                              src={URL.createObjectURL(file.file)}
                              alt={`Thumbnail of ${file.name}`}
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                cursor: "pointer",
                              }}
                              onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                            />
                          </a>
                        )}
                      {/* ชื่อไฟล์เป็นลิงก์สำหรับไฟล์ที่ accepted */}
                      {file.status === "accepted" ? (
                        <a
                          href={URL.createObjectURL(file.file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            textDecoration: "underline",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            const url = e.currentTarget.href;
                            setTimeout(() => URL.revokeObjectURL(url), 100);
                          }}
                        >
                          {file.name} - {(file.size / 1024).toFixed(2)} KB
                        </a>
                      ) : (
                        <span>
                          {file.name} - {(file.size / 1024).toFixed(2)} KB{" "}
                          {file.status === "rejected" && (
                            <span>({file.errors?.join(", ")})</span>
                          )}
                        </span>
                      )}
                      {/* ปุ่มลบ */}
                      <button
                        type="button"
                        onClick={() => handleDelete(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                        style={{ cursor: "pointer" }}
                      >
                        ลบ
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        );
      }}
    />
  );
};

FileDropzone.propTypes = {
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  acceptedFileTypes: PropTypes.object,
  maxFileSize: PropTypes.number,
  fileMultiple: PropTypes.bool,
  setValue: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default FileDropzone;
