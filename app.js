
import React, { Component } from 'react';
import './styles.sass';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faHome } from '@fortawesome/free-solid-svg-icons/faHome';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons/faPlusSquare';
import { faSave } from '@fortawesome/free-solid-svg-icons/faSave';
import { faFill } from '@fortawesome/free-solid-svg-icons/faFill';
import { faAngleDoubleUp } from '@fortawesome/free-solid-svg-icons/faAngleDoubleUp';
import { faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons/faAngleDoubleDown';
import { remote, ipcRenderer } from 'electron';
import Writing from './src/writing';
import Files from './src/files';

// The only way I was able to get this to work was to move my app.js into
// the same location as main.js
const main = remote.require('./main.js');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeFileId: null,
      titleClass: 'title',
      button: false,
      show: true,
      title: '',
    };
    this.onSave = this.onSave.bind(this);
    this.newFile = this.newFile.bind(this);
    this.fillDumbyData = this.fillDumbyData.bind(this);
    this.keyUpUpdate = this.keyUpUpdate.bind(this);
    this.keyDownUpdate = this.keyDownUpdate.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateTitle = this.updateTitle.bind(this);
    this.select = this.select.bind(this);
    this.deselect = this.deselect.bind(this);
    this.twoFuncs = this.twoFuncs.bind(this);
    this.onFileClick = this.onFileClick.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
  }

  // TODO: Add functions for:
  // Add Paragraph by making it it's own react component
  // Add alternate paragraph
  // Switch Paragraph
  // Add save when clicking newFile
  // New file adds file to preview container

  // TODO:
  // Make sure database works correctly when packaging with asar again

  componentDidMount() {
    // console.log('main',main)
    this.getFiles();

    // Listeners are set here because if they are set inside of functions
    // they will exceed max listeners count and slow down the app

    ipcRenderer.on('filesSent', (evt, savedFiles, tf) => {
      console.log('tf in listener', tf);
      if (tf) {
        this.setState({ files: savedFiles }, () => {
          const {
            files: stateFiles,
          } = this.state;
          this.setActiveFile(stateFiles[0]); // eslint-disable-line react/destructuring-assignment
        });
      } else {
        console.log('3.A');
        this.setState({ files: savedFiles });
      }
    });


    ipcRenderer.on('fileDeleted', (evt, id) => {
      const { activeFileId } = this.state;
      this.getFiles();
      if (id === activeFileId) {
        this.newFile();
      }
    });
  }

  //------------------------------------
  onFileClick(file) {
    console.log('onFileClick ran');
    if (document.getElementById('title').value !== '') {
      // this invoke is causing setActiveFile to run twice
      console.log('1.A');
      this.onSave('autosave');
      this.setActiveFile(file);
    } else {
      console.log('1.B');
      this.setActiveFile(file);
    }
    // console.log(title,'title')
    // console.log('file in onFileClick',file)
  }

  //------------------------------------
  onSave(param) {
    const { activeFileId } = this.state;
    const title = document.getElementById('title').value;
    const par1 = document.getElementById('par1').innerHTML;
    const par2 = document.getElementById('par2').innerHTML;
    const par3 = document.getElementById('par3').innerHTML;

    // Checks to make sure Title is not empty
    if (title === '') {
      this.setState({ titleClass: 'title red-shake' });
      setTimeout(() => {
        this.setState({ titleClass: 'title' });
      }, 1000);
      return;
    }

    // update file if exists
    if (activeFileId) {
      console.log('2.Update');
      main.update(activeFileId, title, par1, par2, par3);
      this.getFiles();
    } else if (param === 'autosave') {
      this.save(title, par1, par2, par3);
      this.getFiles();
    } else {
      // auto saving the file onFileClick sets the new file to activeFile


      // Clicking the save button sets the first file to active so it doesn't duplicate itself
      // if you switch off


      // save new file if it does not exists
      console.log('2.New');
      this.save(title, par1, par2, par3);
      this.getFiles(true);
    }
  }

  //------------------------------------
  getFiles(tf) {
    if (tf) {
      main.sendFiles(true);
    } else {
      main.sendFiles(false);
    }
  }

  //------------------------------------
  setActiveFile(file) {
    // make sure all changes are updated to active file
    console.log('file', file);
    console.log('4.setActiveFile');
    this.setState({ activeFileId: file.id });
    // set all textfield values
    document.getElementById('title').value = file.title;
    document.getElementById('par1').innerHTML = file.par1;
    document.getElementById('par2').innerHTML = file.par2;
    document.getElementById('par3').innerHTML = file.par3;
  }

  //------------------------------------
  newFile() {
    // make sure you're not editing another existing file
    this.setState({ activeFileId: '' });
    // clear all textfields
    document.getElementById('title').value = '';
    document.getElementById('par1').innerHTML = '';
    document.getElementById('par2').innerHTML = '';
    document.getElementById('par3').innerHTML = '';
  }

  //------------------------------------
  fillDumbyData() {
    for (let i = 0; i < 10; i += 1) {
      this.save(`Test ${i + 1}`, '', '', '');
    }
    this.getFiles();
  }

  //------------------------------------
  save(title, par1, par2, par3) {
    main.save(title, par1, par2, par3);
    // retrieve files
    // this.getFiles()
  }

  //------------------------------------
  deleteFile(e, id) {
    console.log('deleteFile clicked', e, id);
    e.stopPropagation();
    main.deleteFile(id);
    // ipcRenderer.send('delete',id);
  }

  //------------------------------------
  // This function is mostly to prevent
  // unwanted actions
  keyDownUpdate(e, num) {
    const key = e.keyCode;
    if (key === 13) {
      e.preventDefault();
    } else if (key === 9) {
      // prevents tab key from switching textfields
      e.preventDefault();
      // TODO: Add functionality to insert a double space on tab press
    }
  }

  //------------------------------------
  updateTitle(e) {
    const { value } = e.target;
    this.setState({ title: value });
  }

  //------------------------------------
  // Updates state as you type
  keyUpUpdate(e, num) {
    const key = e.keyCode;
    // var text = e.target.innerHTML.replace(/&nbsp;/g,'')
    const text = e.target.innerHTML;
    const ref = {
      9: 9, 13: 13, 16: 16, 17: 17, 18: 18, 27: 27, 37: 37, 38: 38, 39: 39, 40: 40, 93: 93,
    };
    if (!ref[key]) {
      // Don't try to console.log state because it shows
      // the updated content in state late
      this.setState({ [`par${num}`]: text });
    }
  }

  //------------------------------------
  // Doesn't work because once the value is changed the first time it no
  // no longer has brackets around it
  replace(e) {
    const { value } = e.target;
    const parSelectors = ['par1', 'par2', 'par3'];
    document.getElementById('title').value = document.getElementById('title').value.replace(/{.*?}/g, `{${value}}`);
    parSelectors.forEach((selector) => {
      document.getElementById(selector).innerHTML = document.getElementById(selector).innerHTML.replace(/{.*?}/g, `{${value}}`);
    });
  }

  //------------------------------------
  select() {
    const { value } = document.getElementById('selectBar');
    const re = new RegExp(value, 'g');
    const parSelectors = ['par1', 'par2', 'par3'];
    if (value !== '') {
      document.getElementById('title').value = document.getElementById('title').value.replace(re, `{${value}}`);
      parSelectors.forEach((selector) => {
        document.getElementById(selector).innerHTML = document.getElementById(selector).innerHTML.replace(re, `{${value}}`);
      });
    }
    document.getElementById('selectBar').value = '';
  }

  //------------------------------------
  deselect() {
    // let re = new RegExp(value, "g")
    const parSelectors = ['par1', 'par2', 'par3'];
    document.getElementById('title').value = document.getElementById('title').value.replace(/\{|\}/g, '');
    parSelectors.forEach((selector) => {
      document.getElementById(selector).innerHTML = document.getElementById(selector).innerHTML.replace(/\{|\}/g, '');
    });
    document.getElementById('selectBar').value = '';
  }

  //------------------------------------
  handleClick() {
    document.getElementById('par1').innerHTML = 'Changed value';
    // console.log('clicked');
  }

  //------------------------------------
  testButton() {
    const { show } = this.state;
    this.setState({ show: !show });
  }

  //------------------------------------
  buttonSwitch() {
    const { button } = this.state;
    this.setState({ button: !button });
  }

  //------------------------------------
  twoFuncs() {
    this.testButton();
    this.buttonSwitch();
  }
  //------------------------------------
  render() {
    const {
      titleClass,
      button,
      show,
      files,
      activeFileId,
    } = this.state;
    return (
      <div className="app">
        <div className="sidebar">
          {/* <FontAwesomeIcon icon={faHome} className="home-icon" onClick={this.handleClick.bind(this)} /> */}
          <FontAwesomeIcon icon={faSave} className="home-icon" onClick={this.onSave} />
          <FontAwesomeIcon icon={faPlusSquare} className="home-icon" onClick={this.newFile} />
          <FontAwesomeIcon icon={faFill} className="home-icon" onClick={this.fillDumbyData} />
        </div>
        <div className="writingCom">
          <div className="whole">
            <Writing
              titleClass={titleClass}
              keyUpUpdate={this.keyUpUpdate}
              keyDownUpdate={this.keyDownUpdate}
              handleClick={this.handleClick}
              updateTitle={this.updateTitle}
            />
            <div className="editBar">
              <input id="selectBar" className="variableInput" placeholder="Choose a variable" />
              <button type="submit" className="select-button" onClick={this.select}>Select</button>
              <button type="submit" className="select-button" onClick={this.deselect}>Deselect</button>
              <input
                className="variableInput"
                placeholder="Company Variable"
                onChange={(e) => {
                  this.replace(e);
                }}
              />
              <button className="select-button" onClick={() => main.testPdf()}>Export PDF</button>
            </div>
          </div>
          <div className="button-div">
            <button type="submit" className="prev-button" onClick={this.twoFuncs}>
              {button ? <FontAwesomeIcon icon={faAngleDoubleUp} className="up-icon" /> : <FontAwesomeIcon icon={faAngleDoubleDown} className="up-icon" /> }
            </button>
          </div>
          { show ? (
            <div className="prevContainer">
              {files ? (
                <Files
                  onFileClick={this.onFileClick}
                  files={files}
                  deleteFile={this.deleteFile}
                  activeFileId={activeFileId}
                />
              ) : null}
            </div>
          ) : null }
        </div>
      </div>
    );
  }
}

export default App;
