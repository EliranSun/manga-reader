import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);

    const { mangaChapterNumber } = this.getUrlMangaData();

    this.state = {
      mangaChaptersData: [],
      pageIndex: 0,
      mangaChapterNumber: mangaChapterNumber || '0001',
    };

    this.api = 'http://localhost:4242/getAllChapters';
    this.mangaApi = 'http://localhost:4242/pages';
    this.nextPagesKeys = ['a', 'A', 'ג'];
    this.previousPagesKeys = ['d', 'D', 'ש'];
    this.nextChapterKeys = ['w', 'W', '׳'];
    this.previousChapterKeys = ['s', 'S', 'ד'];
  }

  componentDidMount() {
    this.fetchMangaChaptersData();
    this.listenForKeyboardInput();
    this.setUrlMangaData();
  }

  isMangaChapterCoverDouble = () => {
    const { mangaChaptersData, mangaChapterNumber } = this.state;
    console.log({ mangaChaptersData });
    if (mangaChaptersData[mangaChapterNumber]) {
      console.log({ double: mangaChaptersData[mangaChapterNumber].isCoverPageDouble })
      return mangaChaptersData[mangaChapterNumber].isCoverPageDouble;
    }

    return false;
  };

  setUrlMangaData = () => {
    const { mangaChapterNumber, pageIndex } = this.state;
    const pageNumbers = (this.isMangaChapterCoverDouble() || pageIndex > 0) ?
      `${this.getPageNumberString(pageIndex + 1)}-${this.getPageNumberString(pageIndex + 2)}` :
      '001';

    this.setUrl({ pathname: `/${mangaChapterNumber}/${pageNumbers}` });
  };

  getUrlMangaData = () => {
    const url = new URL(window.location.href);
    const urlParts = url.pathname.split('/').filter(Boolean);

    return {
      mangaChapterNumber: urlParts[0],
      pageIndex: parseInt(urlParts[1].split('-')[0]) - 1,
    };
  }

  setUrl = ({ pathname = '', queryParams = [] }) => {
    const url = new URL(window.location.href);
    url.pathname = pathname;
    Object.entries(queryParams).forEach(([key, value]) => url.searchParams.set(key, value));
    window.history.pushState({}, 'One Piece', url);
  };

  getPageNumberString = pageNumber => {
    return `00${pageNumber}`.substr(pageNumber.toString().length - 1);
  };

  getChapterNumberString = pageNumber => {
    return `000${pageNumber}`.substr(pageNumber.toString().length - 1);
  };

  setMangaPages = pageIndexOperator => {
    let nextState = null;
    const { mangaChapterNumber, mangaChaptersData, pageIndex } = this.state;

    if (pageIndexOperator > 0) { // next pages
      if (pageIndex === 0) {
        nextState = {
          pageIndex: this.isMangaChapterCoverDouble() ? 2 : 1
        };
      } else if (pageIndex + pageIndexOperator >= mangaChaptersData[mangaChapterNumber].numberOfPages) {
        const nextMangaChapter = this.getChapterNumberString(mangaChaptersData[mangaChapterNumber].number + 1);
        if (!mangaChaptersData[nextMangaChapter]) {
          return;
        }

        nextState = {
          mangaChapterNumber: nextMangaChapter,
          pageIndex: 0
        };
      } else {
        nextState = {
          pageIndex: pageIndex + pageIndexOperator
        };
      }
    }

    if (pageIndexOperator < 0) { // previous pages
      if (pageIndex === 1) {
        nextState = {
          pageIndex: 0
        };
      } else if ((pageIndex + pageIndexOperator) < 0) {
        const nextMangaChapter = this.getChapterNumberString(mangaChaptersData[mangaChapterNumber].number - 1);
        if (!mangaChaptersData[nextMangaChapter]) {
          return;
        }

        nextState = {
          mangaChapterNumber: nextMangaChapter,
          pageIndex: mangaChaptersData[nextMangaChapter].numberOfPages + pageIndexOperator
        };
      } else {
        nextState = {
          pageIndex: pageIndex + pageIndexOperator
        };
      }
    }

    if (nextState) {
      this.setState(nextState, this.setUrlMangaData);
    }
  };

  setMangaChapter = chapterIndexOperand => {
    const { mangaChapterNumber } = this.state;
    const nextChapterNumber = parseInt(mangaChapterNumber, 10) + chapterIndexOperand;
    const nextChapter = this.getChapterNumberString(parseInt(mangaChapterNumber, 10) + chapterIndexOperand);

    if (nextChapterNumber < 1) return;

    this.setState({
      pageIndex: 0,
      mangaChapterNumber: nextChapter
    }, this.setUrlMangaData)
  };

  listenForKeyboardInput = () => {
    window.addEventListener('keypress', event => {
      if (this.nextPagesKeys.includes(event.key)) this.setMangaPages(2);
      if (this.previousPagesKeys.includes(event.key)) this.setMangaPages(-2);
      if (this.nextChapterKeys.includes(event.key)) this.setMangaChapter(1);
      if (this.previousChapterKeys.includes(event.key)) this.setMangaChapter(-1);
    });
  };

  fetchMangaChaptersData = async () => {
    const response = await fetch(this.api);
    const result = await response.json();
    if (!result.success) {
      console.error('error fetching all manga pages');
      return;
    }

    this.setState({
      mangaChaptersData: result.body
    });
  };

  render() {
    const { mangaChaptersData, mangaChapterNumber, pageIndex } = this.state;
    if (!mangaChaptersData[mangaChapterNumber]) {
      return <h1>No chapter found! You've reached the end of One Piece!?</h1>;
    }

    return (
      <div className="manga-book">
        <img
          alt="manga-page"
          className="manga-page"
          src={ `${this.mangaApi}/${mangaChaptersData[mangaChapterNumber].fileNames[pageIndex]}` } />
        { (this.isMangaChapterCoverDouble() || pageIndex > 0) &&
          <img
            alt="manga-page"
            className="manga-page"
            src={ `${this.mangaApi}/${mangaChaptersData[mangaChapterNumber].fileNames[pageIndex + 1]}` } /> }
      </div>
    );
  }
}

export default App;
