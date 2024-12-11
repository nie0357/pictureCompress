document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const originalImage = document.getElementById('originalImage');
    const compressedImage = document.getElementById('compressedImage');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalFile = null;

    // 处理上传区域的点击事件
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // 处理拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#007AFF';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#E5E5E5';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#E5E5E5';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    });

    // 处理文件选择
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });

    // 处理图片上传
    function handleImageUpload(file) {
        originalFile = file;
        const reader = new FileReader();

        reader.onload = (e) => {
            originalImage.src = e.target.result;
            originalSize.textContent = formatFileSize(file.size);
            previewContainer.style.display = 'block';
            compressImage(e.target.result, qualitySlider.value / 100);
        };

        reader.readAsDataURL(file);
    }

    // 压缩图片
    function compressImage(src, quality) {
        const img = new Image();
        img.src = src;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            compressedImage.src = compressedDataUrl;

            // 计算压缩后的大小
            const compressedSize = Math.round((compressedDataUrl.length - 22) * 3 / 4);
            document.getElementById('compressedSize').textContent = formatFileSize(compressedSize);

            // 找到下载图片相关的函数
            function downloadImage(blob, fileName) {
                // 创建一个临时的 a 标签用于下载
                const link = document.createElement('a');

                // 创建 blob URL
                const blobUrl = window.URL.createObjectURL(blob);

                // 移动端兼容处理
                if (/mobile|android|iphone/i.test(navigator.userAgent)) {
                    // 移动端采用新窗口打开方式
                    window.open(blobUrl, '_blank');
                } else {
                    // PC端使用常规下载方式
                    link.href = blobUrl;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }

                // 清理 blob URL
                setTimeout(() => {
                    window.URL.revokeObjectURL(blobUrl);
                }, 100);
            }

            // 在转换完成后调用下载函数时
            canvas.toBlob((blob) => {
                const fileName = '转换后的图片.png';
                downloadImage(blob, fileName);
            }, 'image/png');
        };
    }

    // 处理质量滑块变化
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = e.target.value + '%';
        if (originalImage.src) {
            compressImage(originalImage.src, e.target.value / 100);
        }
    });

    // 处理下载
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'compressed-image.jpg';
        link.href = compressedImage.src;
        link.click();
    });

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});