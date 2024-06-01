// メディアファイルのリスト
const mediaFiles = [];

window.onload = () => {
    const videoPlayer = document.getElementById('videoPlayer');
    const audioPlayer = document.getElementById('audioPlayer');
    const mediaList = document.getElementById('mediaList');
    const dropArea = document.getElementById('dropArea');
    const volumeSlider = document.getElementById('volumeSlider');
    const deleteAllButton = document.getElementById('deleteAllButton');
    const playAllButton = document.getElementById('playAllButton');
    const playRandomButton = document.getElementById('playRandomButton');
    const toggleListButton = document.getElementById('toggleListButton');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const repeatButton = document.getElementById('repeatButton');
    let currentTrackIndex = 0;
    let currentPlayer = null;
    let isRepeating = false;
    let activeButton = null;

    // ボタンのアクティブ状態を更新
    function setActiveButton(button) {
        if (activeButton) {
            activeButton.classList.remove('active');
        }
        activeButton = button;
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    // ドロップエリアのイベントリスナー
    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropArea.classList.add('hover');
    });

    dropArea.addEventListener('dragleave', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropArea.classList.remove('hover');
    });

    dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropArea.classList.remove('hover');
        const files = event.dataTransfer.files;
        for (let file of files) {
            if (file.type === 'audio/mpeg' || file.type === 'audio/mp3' || file.type === 'video/mp4') {
                const url = URL.createObjectURL(file);
                mediaFiles.push({ title: file.name, file: url, type: file.type });
                updateMediaList();
            } else {
                alert('MP3（audio/mpeg, audio/mp3）またはMP4ファイルをドロップしてください。');
            }
        }
    });

    // メディアリストを更新
    function updateMediaList() {
        mediaList.innerHTML = '';
        mediaFiles.forEach((media, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = media.title;
            listItem.addEventListener('click', () => {
                loadTrack(index);
                playTrack();
            });

            const deleteButton = document.createElement('span');
            deleteButton.textContent = ' [削除]';
            deleteButton.className = 'delete-button';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteTrack(index);
            });

            listItem.appendChild(deleteButton);
            mediaList.appendChild(listItem);
        });
        updatePlayingTrackHighlight();
    }

    // トラックを読み込む
    function loadTrack(index) {
        currentTrackIndex = index;
        const media = mediaFiles[index];

        if (currentPlayer) {
            currentPlayer.pause();
            currentPlayer.currentTime = 0;
        }

        if (media.type === 'audio/mpeg' || media.type === 'audio/mp3') {
            videoPlayer.style.display = 'none';
            audioPlayer.style.display = 'block';
            audioPlayer.src = media.file;
            audioPlayer.load();
            currentPlayer = audioPlayer;
        } else if (media.type === 'video/mp4') {
            audioPlayer.style.display = 'none';
            videoPlayer.style.display = 'block';
            videoPlayer.src = media.file;
            videoPlayer.load();
            currentPlayer = videoPlayer;
        }

        currentPlayer.addEventListener('loadedmetadata', () => {
            currentPlayer.currentTime = 0;
        });

        currentPlayer.addEventListener('ended', () => {
            if (isRepeating) {
                playTrack();
            } else {
                nextTrack();
            }
        });
        updatePlayingTrackHighlight();
    }

    // トラックを再生する
    function playTrack() {
        currentPlayer.play();
        updatePlayingTrackHighlight();
    }

    // 次のトラックに切り替える
    function nextTrack() {
        if (currentTrackIndex < mediaFiles.length - 1) {
            currentTrackIndex++;
            loadTrack(currentTrackIndex);
            playTrack();
        } else {
            currentTrackIndex = 0;
            loadTrack(currentTrackIndex);
            playTrack();
        }
    }

    // 前のトラックに切り替える
    function prevTrack() {
        if (currentTrackIndex > 0) {
            currentTrackIndex--;
            loadTrack(currentTrackIndex);
            playTrack();
        } else {
            currentTrackIndex = mediaFiles.length - 1;
            loadTrack(currentTrackIndex);
            playTrack();
        }
    }

    // トラックを削除する
    function deleteTrack(index) {
        mediaFiles.splice(index, 1);
        if (index === currentTrackIndex && currentPlayer) {
            currentPlayer.pause();
            currentPlayer.currentTime = 0;
            currentPlayer.src = '';
            currentPlayer.style.display = 'none';
        }
        updateMediaList();
    }

    // 全トラックを削除する
    function deleteAllTracks() {
        mediaFiles.length = 0;
        if (currentPlayer) {
            currentPlayer.pause();
            currentPlayer.currentTime = 0;
            currentPlayer.src = '';
            currentPlayer.style.display = 'none';
        }
        updateMediaList();
    }

    // 全曲を連続再生する
    function playAllTracks() {
        let playNextTrack = () => {
            if (currentTrackIndex < mediaFiles.length) {
                loadTrack(currentTrackIndex);
                playTrack();
                currentPlayer.addEventListener('ended', playNextTrack, { once: true });
                currentTrackIndex++;
            } else {
                currentTrackIndex = 0;
            }
        };

        if (mediaFiles.length > 0) {
            currentTrackIndex = 0;
            playNextTrack();
        }
    }

    // ランダムに1曲再生する
    function playRandomTrack() {
        if (mediaFiles.length > 0) {
            const randomIndex = Math.floor(Math.random() * mediaFiles.length);
            loadTrack(randomIndex);
            playTrack();
        }
    }

    // 現在再生中のトラックをハイライトする
    function updatePlayingTrackHighlight() {
        const items = mediaList.getElementsByTagName('li');
        for (let i = 0; i < items.length; i++) {
            if (i === currentTrackIndex) {
                items[i].classList.add('playing');
            } else {
                items[i].classList.remove('playing');
            }
        }
    }

    // ボタンイベントの設定
    document.getElementById('playButton').addEventListener('click', () => {
        setActiveButton(document.getElementById('playButton'));
        playTrack();
    });

    document.getElementById('pauseButton').addEventListener('click', () => {
        setActiveButton(document.getElementById('pauseButton'));
        if (currentPlayer) currentPlayer.pause();
    });

    document.getElementById('stopButton').addEventListener('click', () => {
        setActiveButton(document.getElementById('stopButton'));
        if (currentPlayer) {
            currentPlayer.pause();
            currentPlayer.currentTime = 0;
        }
    });

    prevButton.addEventListener('click', () => {
        setActiveButton(prevButton);
        prevTrack();
    });

    nextButton.addEventListener('click', () => {
        setActiveButton(nextButton);
        nextTrack();
    });

    repeatButton.addEventListener('click', () => {
        isRepeating = !isRepeating;
        repeatButton.classList.toggle('active', isRepeating);
    });

    playAllButton.addEventListener('click', () => {
        setActiveButton(playAllButton);
        playAllTracks();
    });

    playRandomButton.addEventListener('click', () => {
        setActiveButton(playRandomButton);
        playRandomTrack();
    });

    deleteAllButton.addEventListener('click', () => {
        deleteAllTracks();
    });

    volumeSlider.addEventListener('input', (event) => {
        if (currentPlayer) {
            currentPlayer.volume = event.target.value;
        }
    });

    toggleListButton.addEventListener('click', () => {
        const isVisible = mediaList.style.display === 'block';
        mediaList.style.display = isVisible ? 'none' : 'block';
    });
};
