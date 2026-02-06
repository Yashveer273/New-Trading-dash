import React, { useState, useEffect, useCallback } from "react";
import {
  addStock,
  bulkUpdateStocks,
  deleteStock,
  fetchStocks,
  updateProductDetails,
  updateStock,
} from "./api";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
  import "./StocksDB.css";
const StocksDB = () => {
  // --- State Management ---
  const [products, setProducts] = useState([]);
  const [originalData, setOriginalData] = useState(new Map());
  const [pendingUpdates, setPendingUpdates] = useState(new Map());

  const [newProduct, setNewProduct] = useState({
    symbol: "",
    companyName: "",
    currentPrice: "",
  });
  const [editData, setEditData] = useState({
    id: "",
    symbol: "",
    companyName: "",
    isOpen: false,
  });

  const [toast, setToast] = useState({ show: false, msg: "", type: "" });


  // --- Core Logic ---
  const loadData = useCallback(async () => {
 
    try {
      const result = await fetchStocks();
      if (result.success) {
        const fetchedProducts = result.products || [];
        setProducts(fetchedProducts);

        const newOriginalMap = new Map();
        fetchedProducts.forEach((p) => {
          newOriginalMap.set(p._id, {
            price: p.currentPrice,
            percent: p.priceChangePercent,
          });
        });
        setOriginalData(newOriginalMap);
        setPendingUpdates(new Map());
      }
    } catch (err) {
        console.log(err);

      showToast("Failed to fetch data", "error");
    } 
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const result = await addStock({
        ...newProduct,
        currentPrice: parseFloat(newProduct.currentPrice),
      });
      if (result.success) {
        loadData();
        setNewProduct({ symbol: "", companyName: "", currentPrice: "" });
        showToast("Product Added", "success");
      }
    } catch (err) {
        console.log(err);

      showToast("Add Failed", "error");
    }
  };

  const handleInstantUpdate = async (id) => {
    const update = pendingUpdates.get(id);
    if (!update) return;
    try {
      const result = await updateStock(id, {
        currentPrice: update.currentPrice,
        priceChangePercent: update.priceChangePercent,
      });
      if (result.success) {
        showToast("Update Saved", "success");
        loadData();
      }
    } catch (err) {
        console.log(err);

      showToast("Save Failed", "error");
    }
  };

  const handleBulkUpdate = async () => {
    const updates = Array.from(pendingUpdates.values());
    try {
      const result = await bulkUpdateStocks(updates);
      if (result.success) {
        showToast("Bulk Update Success", "success");
        loadData();
      }
    } catch (err) {
        console.log(err);

      showToast("Bulk Failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete product?")) return;
    try {
      const result = await deleteStock(id);
      if (result.success) {
        showToast("Deleted", "success");
        loadData();
      }
    } catch (err) {
        console.log(err);


      showToast("Delete Failed", "error");
    }
  };

  const handleSaveInfo = async () => {
    try {
      const result = await updateProductDetails(editData.id, {
        symbol: editData.symbol,
        companyName: editData.companyName,
      });
      if (result.success) {
        loadData();
        setEditData({ ...editData, isOpen: false });
        showToast("Info Updated", "success");
      }
    } catch (err) {
        console.log(err);
      showToast("Update Failed", "error");
    }
  };

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
  };

  const syncFromPrice = (id, priceStr) => {
    const val = parseFloat(priceStr) || 0;
    const original = originalData.get(id);
    let newPercent = original.percent;
    if (original.price !== 0) {
      newPercent = ((val - original.price) / original.price) * 100;
    }
    updatePending(id, val, newPercent);
  };

  const syncFromPercent = (id, percentStr) => {
    const val = parseFloat(percentStr) || 0;
    const original = originalData.get(id);
    const newPrice = original.price * (1 + val / 100);
    updatePending(id, newPrice, val);
  };

  const updatePending = (id, price, percent) => {
    const newMap = new Map(pendingUpdates);
    newMap.set(id, {
      _id: id,
      currentPrice: price,
      priceChangePercent: percent,
    });
    setPendingUpdates(newMap);
  };

  const resetRow = (id) => {
    const newMap = new Map(pendingUpdates);
    newMap.delete(id);
    setPendingUpdates(newMap);
  };

  

 return (
  <div className="appBg">
    <div className="container">
      <header className="header">
        <div>
          <h1 className="title">Asset Management</h1>
       
        </div>
        <button className="btn secondaryBtn" onClick={loadData}>
          <i className="fa-solid fa-rotate iconSpace"></i> Sync
        </button>
      </header>

      <div className="grid">
        <aside>
          <div className="card">
            <h2 className="sectionTitle">Register New Asset</h2>
            <form onSubmit={handleAddProduct}>
              <label className="label">SYMBOL</label>
              <input className="input" value={newProduct.symbol} onChange={e => setNewProduct({...newProduct, symbol: e.target.value.toUpperCase()})} required />

              <label className="label">NAME</label>
              <input className="input" value={newProduct.companyName} onChange={e => setNewProduct({...newProduct, companyName: e.target.value})} required />

              <label className="label">INITIAL PRICE</label>
              <input type="number" className="input" value={newProduct.currentPrice} onChange={e => setNewProduct({...newProduct, currentPrice: e.target.value})} required />

              <button className="btn primaryBtn fullBtn">Create Security</button>
            </form>
          </div>
        </aside>

   

          <div className="card tableCard">
            
          {pendingUpdates.size > 0 && (
            <div className="card pendingBox">
              <span className="pendingText">{pendingUpdates.size} changes pending</span>
              <button onClick={handleBulkUpdate} className="btn primaryBtn">Save All Changes</button>
            </div>
          )}
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Security</th>
                  <th className="th center">Trade</th>
                  <th className="th right">Valuation</th>
                  <th className="th right">Variation (%)</th>
                  <th className="th center">Manage</th>
                </tr>
              </thead>

              <tbody>
                {products.map(p => {
                  const update = pendingUpdates.get(p._id);
                  const original = originalData.get(p._id);
                  const curP = update ? update.currentPrice : p.currentPrice;
                  const curV = update ? update.priceChangePercent : p.priceChangePercent;
                  const isUp = curP > original?.price;
                  const isDown = curP < original?.price;

                  return (
                    <tr key={p._id}>
                      <td className="td">
                        <div className="symbol">{p.symbol}</div>
                        <div className="company">{p.companyName}</div>
                      </td>

                      <td className="td center width140">
                        {p.trend === "UP" && <div className="trend up"><TrendingUp size={18}/> UP</div>}
                        {p.trend === "DOWN" && <div className="trend down"><TrendingDown size={18}/> DOWN</div>}
                        {p.trend === "NO_CHANGE" && <div className="trend flat"><Minus size={18}/> FLAT</div>}
                      </td>

                      <td className="td width180">
                        <div className={`inputFieldContainer ${isUp ? 'priceUp' : isDown ? 'priceDown' : ''}`}>
                          <span className="unitLabel">$</span>
                          <input type="number" className="embeddedInput" value={curP} onChange={e => syncFromPrice(p._id, e.target.value)} />
                        </div>
                      </td>

                      <td className="td width160">
                        <div className={`inputFieldContainer ${isUp ? 'priceUp' : isDown ? 'priceDown' : ''}`}>
                          <span className="unitLabel">%</span>
                          <input type="number" className="embeddedInput" value={Number(curV).toFixed(2)} onChange={e => syncFromPercent(p._id, e.target.value)} />
                        </div>
                      </td>

                      <td className="td center">
                        <div className="manageBtns">
                          {update ? (
                            <>
                              <button onClick={() => handleInstantUpdate(p._id)} className="btn primaryBtn smallBtn">Save</button>
                              <button onClick={() => resetRow(p._id)} className="btn resetBtn smallBtn">Reset</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => setEditData({ id: p._id, symbol: p.symbol, companyName: p.companyName, isOpen: true })} className="btn secondaryBtn smallBtn">Edit</button>
                              <button onClick={() => handleDelete(p._id)} className="btn dangerBtn smallBtn">Delete</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
       
      </div>
    </div>

    {editData.isOpen && (
      <div className="modalOverlay">
        <div className="card modalCard">
          <h3 className="modalTitle">Update Details</h3>
          <label className="label">SYMBOL</label>
          <input className="input" value={editData.symbol} onChange={e => setEditData({...editData, symbol: e.target.value.toUpperCase()})} />
          <label className="label">FULL NAME</label>
          <input className="input" value={editData.companyName} onChange={e => setEditData({...editData, companyName: e.target.value})} />
          <div className="modalBtns">
            <button className="btn primaryBtn flex1" onClick={handleSaveInfo}>Update</button>
            <button className="btn secondaryBtn" onClick={() => setEditData({ ...editData, isOpen: false })}>Cancel</button>
          </div>
        </div>
      </div>
    )}

    {toast.show && (
      <div className={`toast ${toast.type === "success" ? "toastSuccess" : "toastError"}`}>
        {toast.msg}
      </div>
    )}
  </div>
);

};

export default StocksDB;
