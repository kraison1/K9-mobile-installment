import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { isArray, isEmpty } from "lodash";
import { generateMultipleBarcodesPDF } from "src/components/multipleBarcodeGenerator";
import axiosApi from "src/helpers/api";
import { error as alertError } from "src/components/alart";

export const addProduct = createAsyncThunk(
  "appProduct/addProduct",
  async (item, { dispatch, getState }) => {
    try {
      const response = await axiosApi.postForm(`/products`, item);
      const state = getState();
      const params = state.product.params;
      if (!isEmpty(params)) {
        dispatch(fetchProduct(params));
      }

      return response.data;
    } catch (error) {
      console.error("addProduct", error);
    }
  },
);
export const addProductMultiple = createAsyncThunk(
  "appProduct/addProductMultiple",
  async (item, { dispatch, getState }) => {
    try {
      const response = await axiosApi.post(`/products/createMultiple`, item);

      const { newProducts } = response.data;

      if (isArray(newProducts)) {
        setTimeout(() => {
          generateMultipleBarcodesPDF(newProducts);
        }, 3000);
      }

      const state = getState();
      const params = state.product.params;
      if (!isEmpty(params)) {
        dispatch(fetchProduct(params));
      }
    } catch (error) {
      console.error("addProductMultiple", error);
    }
  },
);

export const findAccessibilityByProductId = createAsyncThunk(
  "appProduct/findAccessibilityByProductId",
  async (item, { dispatch, getState }) => {
    try {
      const response = await axiosApi.postForm(
        `/products/findAccessibilityByProductId/${item.id}`,
        item,
      );
      return response;
    } catch (error) {
      console.error("findAccessibilityByProductId", error);
    }
  },
);

export const addProductAccessibility = createAsyncThunk(
  "appProduct/addProductAccessibility",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/products`, item);
      const state = getState();
      const params = state.product.paramsAccessibility;
      dispatch(fetchProductAccessibility(params));
    } catch (error) {
      console.error("addProductAccessibility", error);
    }
  },
);

export const addProductRepair = createAsyncThunk(
  "appProduct/addProductRepair",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.postForm(`/products`, item);
      const state = getState();
      const params = state.product.paramsRepair;
      dispatch(fetchProductRepair(params));
    } catch (error) {
      console.error("addProductRepair", error);
    }
  },
);

export const fetchProduct = createAsyncThunk(
  "appProduct/fetchProduct",
  async (item) => {
    try {
      const response = await axiosApi.post(`/products/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProduct", error);
    }
  },
);

export const fetchProductAccessibility = createAsyncThunk(
  "appProduct/fetchProductAccessibility",
  async (item) => {
    try {
      const response = await axiosApi.post(`/products/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductAccessibility", error);
    }
  },
);

export const fetchProductRepair = createAsyncThunk(
  "appProduct/fetchProductRepair",
  async (item) => {
    try {
      const response = await axiosApi.post(`/products/search`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductRepair", error);
    }
  },
);

export const fetchProductFindSale = createAsyncThunk(
  "appProduct/fetchProductFindSale",
  async (item) => {
    try {
      const response = await axiosApi.post(`/products/searchSales`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchProductFindSale", error);
    }
  },
);

export const fetchBrandsSelectBy = createAsyncThunk(
  "appProduct/fetchBrandsSelectBy",
  async (item) => {
    try {
      const response = await axiosApi.post(`/products/selectBy`, item);
      return {
        params: item,
        allData: response.data,
      };
    } catch (error) {
      console.error("fetchBrandsSelectBy", error);
    }
  },
);

export const fetchInfoProduct = createAsyncThunk(
  "appProduct/fetchInfoProduct",
  async (item) => {
    try {
      const response = await axiosApi.get(`/products/${item}`);
      return response.data;
    } catch (error) {
      console.error("fetchInfoProduct", error);
    }
  },
);

export const fetchSelectProduct = createAsyncThunk(
  "appProduct/fetchSelectProduct",
  async (item) => {
    try {
      const response = await axiosApi.get(
        `/products/select/${item.branchId}/${item.catalog}/${item.search}/${item.active}`,
      );
      return response.data;
    } catch (error) {
      console.error("fetchSelectProduct", error);
    }
  },
);

export const fetchScanProduct = createAsyncThunk(
  "appProduct/fetchScanProduct",
  async (item) => {
    try {
      const response = await axiosApi.get(
        `/products/scanProduct/${item.branchId}/${item.catalog}/${item.search}/${item.active}`,
      );
      return response.data;
    } catch (error) {
      console.error("fetchScanProduct", error);
    }
  },
);

export const fetchSelectProductTransfer = createAsyncThunk(
  "appProduct/fetchSelectProductTransfer",
  async (item) => {
    try {
      const response = await axiosApi.get(
        `/transfer-product-branch/transferProductBranchId/${item}`,
      );

      return response.data;
    } catch (error) {
      console.error("fetchSelectProductTransfer", error);
    }
  },
);

export const updateProduct = createAsyncThunk(
  "appProduct/updateProduct",
  async (item, { dispatch, getState }) => {
    try {
      const response = await axiosApi.patchForm(`/products/${item.id}`, item);

      const state = getState();

      const params = state.product.params;
      if (!isEmpty(params)) {
        dispatch(fetchProduct(params));
      }

      if (!isEmpty(params)) {
        dispatch(fetchProduct(params));
      }

      return response.data;
    } catch (error) {
      console.error("updateProduct", error);
    }
  },
);

export const updateProductBuy = createAsyncThunk(
  "appProduct/updateProductBuy",
  async (item) => {
    try {
      await axiosApi.postForm(`/products/updateProductBuy/${item.id}`, item);
    } catch (error) {
      console.error("updateProductBuy", error);
    }
  },
);

export const updateProductAccessibility = createAsyncThunk(
  "appProduct/updateProductAccessibility",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/products/${item.id}`, item);

      const state = getState();

      const params = state.product.paramsAccessibility;
      dispatch(fetchProductAccessibility(params));
    } catch (error) {
      console.error("updateProductAccessibility", error);
    }
  },
);

export const updateProductRepair = createAsyncThunk(
  "appProduct/updateProductRepair",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.patchForm(`/products/${item.id}`, item);

      const state = getState();

      const params = state.product.paramsRepair;
      dispatch(fetchProductRepair(params));
    } catch (error) {
      console.error("updateProductRepair", error);
    }
  },
);

export const deleteProduct = createAsyncThunk(
  "appCustomers/deleteProduct",
  async (item, { dispatch, getState }) => {
    try {
      await axiosApi.delete(`/products/${item.id}`);

      const state = getState();

      const params = state.product.params;
      // console.log("params", params);
      dispatch(fetchProduct(params));
    } catch (error) {
      console.error("deleteProduct", error);
    }
  },
);

export const printStockAction = createAsyncThunk(
  "appProduct/printStockAction",
  async (item, { rejectWithValue }) => {
    try {
      const response = await axiosApi.get(`/products/printStock/${item}`, {
        responseType: "blob",
      });

      // กรณีสำเร็จ: สร้าง PDF URL จาก Blob
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      return pdfUrl;
    } catch (error) {
      // console.error("printStock error:", error);

      // กรณีเกิด error: ตรวจสอบว่า backend ส่ง message_error กลับมาหรือไม่
      if (error.response) {
        // ถ้า response เป็น Blob (เช่น backend ส่ง JSON แต่ถูกตีความเป็น Blob เนื่องจาก responseType)
        const reader = new FileReader();
        reader.readAsText(error.response.data); // อ่าน Blob เป็น text
        return new Promise((resolve, reject) => {
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result); // แปลง text เป็น JSON
              const messageError =
                errorData?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
              alertError(messageError);
              reject(rejectWithValue(messageError)); // ส่ง message_error ไปใน rejectWithValue
            } catch (e) {
              reject(rejectWithValue("ไม่สามารถอ่านข้อความข้อผิดพลาดได้"));
            }
          };
          reader.onerror = () =>
            reject(rejectWithValue("เกิดข้อผิดพลาดในการอ่านข้อมูล"));
        });
      } else {
        // กรณีไม่มี response (เช่น network error)
        return rejectWithValue("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    }
  },
);

export const appProductsSlice = createSlice({
  name: "appProduct",
  initialState: {
    params: {},
    paramsAccessibility: {},
    paramsRepair: {},
    paramsSaleRepair: {},

    data: {},
    select: [],
    allData: [],
    allDataAccessibility: [],
    allDataRepair: [],
    allDataSaleRepair: [],

    transferProduct: [],
    modelMobile: [],
    modelRepair: [],
    modelAccessibility: [],
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchProductFindSale.fulfilled, (state, action) => {
        state.paramsSaleRepair = action.payload.params;
        state.allDataSaleRepair = action.payload.allData;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.params = action.payload.params;
        state.allData = action.payload.allData;
      })
      .addCase(fetchProductAccessibility.fulfilled, (state, action) => {
        state.paramsAccessibility = action.payload.params;
        state.allDataAccessibility = action.payload.allData;
      })
      .addCase(fetchProductRepair.fulfilled, (state, action) => {
        state.paramsRepair = action.payload.params;
        state.allDataRepair = action.payload.allData;
      })

      .addCase(fetchInfoProduct.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchSelectProductTransfer.fulfilled, (state, action) => {
        state.transferProduct = action.payload;
      })
      .addCase(fetchSelectProduct.fulfilled, (state, action) => {
        state.select = action.payload;
      })

      .addCase(fetchBrandsSelectBy.fulfilled, (state, action) => {
        if (action.payload.params.catalog == "มือถือ") {
          state.modelMobile = action.payload.allData;
        } else if (action.payload.params.catalog == "อุปกรณ์เสริม") {
          state.modelAccessibility = action.payload.allData;
        } else {
          state.modelRepair = action.payload.allData;
        }
      });
  },
});

export default appProductsSlice.reducer;
