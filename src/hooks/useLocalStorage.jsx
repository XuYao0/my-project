// 文件存储模块（fileDB.js）
const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AudioStorage', 1);
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' });
        }
      };
  
      request.onsuccess = () => resolve(request.result);
      request.onerror = reject;
    });
  };
  
// 保存文件
const saveFile = async (id, file) => {
  const db = await openDB();
  console.log("saveFile函数：", file)
  const tx = db.transaction('files', 'readwrite');
  await tx.objectStore('files').put({ id, file });
};

// 读取文件
const getFile = (id) => {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction('files', 'readonly');
    const request = tx.objectStore('files').get(id);

    request.onsuccess = () => {
      console.log("从 IndexedDB 读取的对象：", request.result);
      resolve(request.result?.file || null);
    };

    request.onerror = () => {
      console.error("从 IndexedDB 获取文件失败");
      reject(null);
    };
  });
};

// 删除文件
const deleteFile = async (id) => {
  try {
    const db = await openDB();
    const tx = db.transaction('files', 'readwrite');
    await tx.objectStore('files').delete(id);
    console.log('从IndexedDB删除文件成功');
  }
  catch (error) {
    console.log('从IndexedDB删除文件失败');
  }
}

const useLoacalStorage = () => {
  return {
      saveFile,
      getFile,
      deleteFile,
  }
}

export default useLoacalStorage;