/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { MdBuild, MdClose, MdKeyboardArrowRight } from "react-icons/md";
import { AllRouters } from "src/routers";
import { useAuth } from "src/hooks/authContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchInfoUserGroup } from "src/store/userGroup";

const etcPermissions = {
  icon: MdBuild,
  label: "สิทธิพิเศษเพิ่มเติม",
  id: "etc-permissions",
  authRequired: true,
  children: [
    { label: "สามารถดูได้ทุกสาขา", id: "view-all-branches" },
    { label: "แก้ไข AppleID ในสัญญา", id: "edit-appleId" },
    { label: "สามารถเลือกปฏิทินได้", id: "view-all-calendar" },
    { label: "เพิ่มข้อมูลได้บางอย่าง", id: "create-something" },
    { label: "สามารถลบข้อมูล", id: "can-deleted" },
    { label: "แก้ไขหลักฐานการชำระ", id: "edit-image-payment" },
    { label: "เห็นค่าบริกรดูแลรายเดือน", id: "view-productPayMent" },
    { label: "สามารถแก้ไขข้อมูลสัญญา", id: "edit-contract" },
    { label: "สามารถดูสินค้าทุกสาขา", id: "view-all-products" },
    { label: "สามารถดูลูกค้าทุกสาขา", id: "view-all-customers" },
    {
      label: "สามารถอัพเดตตารางค่าบริการดูแล (ค่าทวงถาม/โน๊ต)",
      id: "can-update-payment",
    },
    { label: "เห็นกำไรขาดทุน", id: "view-profit-loss" },
    { label: "เห็นสถานะสินค้า", id: "view-status-product" },
  ],
};

const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)));
const getSelfKeys = (node) => uniq([node?.id, ...(node?.legacyIds || [])]);

// ✅ ดึง id+legacyIds ทั้ง subtree (ตัวเอง + ลูกหลาน)
const collectSubtreeKeys = (node) => {
  const self = getSelfKeys(node);
  const kids = Array.isArray(node?.children) ? node.children : [];
  const childKeys = kids.flatMap((c) => collectSubtreeKeys(c));
  return uniq([...self, ...childKeys]);
};

// ✅ ดึง "ทุก permission ที่ควรมีในระบบ" (AllRouters + etc)
const buildAllPermissionKeys = () => {
  const routerKeys = AllRouters.filter((r) => r.authRequired).flatMap((r) =>
    collectSubtreeKeys(r),
  );
  const etcKeys = collectSubtreeKeys(etcPermissions);
  return uniq([...routerKeys, ...etcKeys]);
};

// ✅ helper: subtree ถูกเลือกครบไหม
const isSubtreeFullySelected = (node, selected) => {
  const keys = collectSubtreeKeys(node);
  return keys.every((k) => selected.includes(k));
};

// ✅ helper: subtree มีเลือกอย่างน้อย 1 ไหม
const isSubtreePartiallySelected = (node, selected) => {
  const keys = collectSubtreeKeys(node);
  return keys.some((k) => selected.includes(k));
};

const ModalUserGroup = ({
  open,
  setModal,
  RowData,
  submitRow,
  permissions,
}) => {
  const { isLoadingOpen, setIsLoadingOpen } = useAuth();
  const dispatch = useDispatch();
  const store = useSelector((state) => state.userGroup);

  const [Permissions, setPermissions] = React.useState([]);
  const [CollapsedItems, setCollapsedItems] = React.useState([]);
  const [isAllSelected, setIsAllSelected] = React.useState(false);

  const modalRef = React.useRef(null);
  const container = React.useRef(null);

  const ALL_KEYS = React.useMemo(() => buildAllPermissionKeys(), []);

  const toggleCollapse = (id) => {
    setCollapsedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.concat(id),
    );
  };

  // ✅ เลือก/ยกเลิกทั้งหมด
  const handleSelectAll = () => {
    if (isAllSelected) {
      const keep = []; // ตัวอย่าง: ["contacts-down"] ถ้าต้องการล็อกไว้
      setPermissions((prev) => prev.filter((id) => keep.includes(id)));
      setIsAllSelected(false);
      return;
    }

    setPermissions((prev) => uniq([...prev, ...ALL_KEYS]));
    setIsAllSelected(true);
  };

  // ✅ ติ๊ก/ยกเลิก node หนึ่งตัว: กระทบทั้ง subtree (รวม legacyIds)
  const handleToggleNode = (node, checked) => {
    const keys = collectSubtreeKeys(node);

    setPermissions((prev) => {
      const next = checked
        ? uniq([...prev, ...keys])
        : prev.filter((k) => !keys.includes(k));

      setIsAllSelected(ALL_KEYS.every((k) => next.includes(k)));
      return next;
    });
  };

  React.useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();

      if (!isNaN(RowData.id)) {
        fetchInfo(RowData.id);
      } else {
        reset(RowData);
        const newPerm = permissions || [];
        setPermissions(newPerm);
        setIsAllSelected(ALL_KEYS.every((k) => newPerm.includes(k)));
      }
    }
  }, [open]);

  React.useEffect(() => {
    if (!isEmpty(store.data) && !isNaN(RowData.id)) {
      const { permissions: p, ...res } = store.data;
      reset(res);

      const newPerm = p || [];
      setPermissions(newPerm);
      setIsAllSelected(ALL_KEYS.every((k) => newPerm.includes(k)));
    }
  }, [store]);

  const fetchInfo = (id) => {
    setIsLoadingOpen(true);
    dispatch(fetchInfoUserGroup(id))
      .unwrap()
      .then(() => setIsLoadingOpen(false))
      .catch((error) => {
        setIsLoadingOpen(false);
        console.error("Failed to fetch user group:", error);
      });
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: RowData });

  const onSubmit = (data) => {
    submitRow({ ...data, permissions: Permissions });
  };

  // ✅ Permission Tree Node (ทำเป็น component เพื่อใช้ hook ได้ถูกต้อง)
  const PermissionNode = ({ node, level }) => {
    // AllRouters: authRequired=false ไม่แสดง / etcPermissions children ไม่มี authRequired ก็ให้แสดง
    if (!node?.authRequired && node?.authRequired !== undefined) return null;

    const hasChildren =
      Array.isArray(node?.children) && node.children.length > 0;
    const expanded = CollapsedItems.includes(node.id);

    const full = isSubtreeFullySelected(node, Permissions);
    const partial = isSubtreePartiallySelected(node, Permissions);

    // ✅ พ่อ: checked = มีเลือกอย่างน้อย 1 (partial)
    // ✅ leaf: checked = key ของตัวเองอยู่
    const checked = hasChildren
      ? partial
      : getSelfKeys(node).some((k) => Permissions.includes(k));

    // ✅ indeterminate เมื่อเลือกบางส่วน (partial=true แต่ full=false)
    const checkboxRef = React.useRef(null);
    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = hasChildren && partial && !full;
      }
    }, [hasChildren, partial, full]);

    return (
      <li>
        <div className="flex items-center p-1">
          <input
            ref={checkboxRef}
            type="checkbox"
            name={node.id}
            id={node.id}
            className="form-checkbox h-5 w-5 text-gray-600"
            checked={checked}
            onChange={(e) => handleToggleNode(node, e.target.checked)}
          />

          {level === 0 && node.icon ? (
            <node.icon size={20} className="ml-2" />
          ) : null}

          <span
            className={`ml-2 flex items-center ${hasChildren ? "cursor-pointer" : ""}`}
            onClick={() => (hasChildren ? toggleCollapse(node.id) : null)}
            style={{ paddingLeft: level > 0 ? 8 : 0 }}
          >
            {level > 0 ? "— " : ""}
            {node.label}

            {hasChildren && (
              <MdKeyboardArrowRight
                className={`ml-10 transition-transform ${
                  expanded ? "transform rotate-90" : ""
                }`}
              />
            )}
          </span>
        </div>

        {hasChildren && expanded && (
          <ul className="ml-5 flex-col">
            {node.children.map((child) => (
              <PermissionNode key={child.id} node={child} level={level + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  };

  PermissionNode.propTypes = {
    node: PropTypes.object.isRequired,
    level: PropTypes.number.isRequired,
  };

  const routerRootNodes = AllRouters.filter((r) => r.authRequired);

  return (
    <div
      ref={modalRef}
      tabIndex="-1"
      className={`${
        open
          ? "flex justify-center items-center absolute inset-0 overflow-y-auto z-10 overflow-x-hidden p-5 bg-gray-300 bg-opacity-70"
          : "hidden"
      }`}
      onKeyDown={(e) => (e.key === "Escape" ? setModal(false) : null)}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-2xl"
        ref={container}
      >
        <div className="bg-white rounded-lg shadow overflow-y-auto max-h-[95vh]">
          <div className="flex items-center justify-between p-3 border-b rounded-t">
            <h3 className="text-xl font-semibold text-gray-900">
              {isNaN(RowData.id)
                ? "เพิ่มรายการใหม่"
                : `แก้ไขรายการ: ${RowData.name}`}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              onClick={() => setModal(false)}
            >
              <MdClose />
            </button>
          </div>

          <div className="p-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* ---------- name ---------- */}
            <div className="items-center col-span-1 lg:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                ชื่อ
              </label>
              <Controller
                id="name"
                name="name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                )}
              />
              {errors.name && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาใส่ข้อมูล ชื่อ
                </span>
              )}
            </div>

            {/* ---------- type ---------- */}
            <div className="items-center col-span-1 lg:col-span-2">
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ประเภท
              </label>
              <Controller
                name="type"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <input
                        {...field}
                        id="type-admin"
                        type="radio"
                        value="ผู้ดูแลระบบ"
                        checked={field.value === "ผู้ดูแลระบบ"}
                        onChange={() => field.onChange("ผู้ดูแลระบบ")}
                        className="mr-2"
                      />
                      <label htmlFor="type-admin" className="text-red-400">
                        ผู้ดูแลระบบ
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...field}
                        id="type-employee"
                        type="radio"
                        value="พนักงาน"
                        checked={field.value === "พนักงาน"}
                        onChange={() => field.onChange("พนักงาน")}
                        className="mr-2"
                      />
                      <label htmlFor="type-employee" className="text-blue-400">
                        พนักงาน
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...field}
                        id="type-customer"
                        type="radio"
                        value="ลูกค้า"
                        checked={field.value === "ลูกค้า"}
                        onChange={() => field.onChange("ลูกค้า")}
                        className="mr-2"
                      />
                      <label htmlFor="type-customer" className="text-blue-400">
                        ลูกค้า
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...field}
                        id="type-admin-facebook"
                        type="radio"
                        value="admin-external"
                        checked={field.value === "admin-external"}
                        onChange={() => field.onChange("admin-external")}
                        className="mr-2"
                      />
                      <label
                        htmlFor="type-admin-facebook"
                        className="text-blue-400"
                      >
                        admin facebook/ร้านตู้
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...field}
                        id="type-finance"
                        type="radio"
                        value="ไฟแนนซ์"
                        checked={field.value === "ไฟแนนซ์"}
                        onChange={() => field.onChange("ไฟแนนซ์")}
                        className="mr-2"
                      />
                      <label htmlFor="type-finance" className="text-yellow-400">
                        ไฟแนนซ์
                      </label>
                    </div>
                  </div>
                )}
              />
              {errors.type && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล ประเภท
                </span>
              )}
            </div>

            {/* ---------- active ---------- */}
            <div className="items-center col-span-1 lg:col-span-1">
              <label
                htmlFor="active"
                className="block text-sm font-medium text-gray-700 mr-2"
              >
                สถานะ
              </label>
              <Controller
                name="active"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      id="active-0"
                      type="radio"
                      value="0"
                      checked={field.value === "0"}
                      onChange={() => field.onChange("0")}
                      className="mr-2"
                    />
                    <label htmlFor="active-0" className="text-red-400">
                      ปิดใช้งาน
                    </label>
                    <input
                      {...field}
                      id="active-1"
                      type="radio"
                      value="1"
                      checked={field.value === "1"}
                      onChange={() => field.onChange("1")}
                      className="mr-2 ml-4"
                    />
                    <label htmlFor="active-1" className="text-green-400">
                      เปิดใช้งาน
                    </label>
                  </div>
                )}
              />
              {errors.active && (
                <span className="text-red-500 text-xs mt-1">
                  กรุณาเลือกข้อมูล สถานะ
                </span>
              )}
            </div>

            {/* ---------- permissions ---------- */}
            <div className="items-center col-span-1 lg:col-span-2 border-t-2">
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm">ให้เห็นเมนู</p>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="py-1 px-3 text-sm text-white bg-indigo-400 rounded-lg border border-indigo-400 hover:bg-indigo-500"
                >
                  {isAllSelected ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
                </button>
              </div>

              <ul className="max-w-md space-y-1 text-gray-500 mt-4">
                {routerRootNodes.map((r) => (
                  <PermissionNode key={r.id} node={r} level={0} />
                ))}
                <PermissionNode node={etcPermissions} level={0} />
              </ul>
            </div>
          </div>

          <div className="flex justify-end items-center p-4 lg:p-5 border-t border-gray-200 rounded-b">
            <button
              disabled={isLoadingOpen}
              type="submit"
              className="py-2 px-5 ml-3 text-sm text-white bg-blue-400 rounded-lg border border-blue-400 hover:bg-blue-500"
            >
              ยืนยัน
            </button>
            <button
              onClick={() => setModal(!open)}
              type="button"
              className="py-2.5 px-5 ml-3 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-red-300 hover:text-white"
            >
              ปิด
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

ModalUserGroup.propTypes = {
  open: PropTypes.bool,
  setModal: PropTypes.func,
  RowData: PropTypes.object,
  submitRow: PropTypes.func,
  permissions: PropTypes.array,
};

export default ModalUserGroup;
