import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import Color from '../abis/Color.json'

class App extends Component {


  mint = (color) => {
    this.state.contract.methods.mint(color).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({
        colors: [...this.state.colors, color]
      })
    })
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      contract: null,
      totalSupply: 0,
      colors: []
    }
  }

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      console.log("SUCCESS 1")
      await window.ethereum.enable()
    }
    else if (window.web3) {
      console.log("SUCCESS 2")
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
    
    const networkId = await web3.eth.net.getId()
    const networkData = Color.networks[networkId]
    if(networkData) {
      const abi = Color.abi
      const address = networkData.address
      const contract = new web3.eth.Contract(abi, address)
      this.setState({ contract })
      const totalSupply = await contract.methods.totalSupply().call()
      this.setState({ totalSupply })
      // Load Colors 
      for(var i = 1; i <= totalSupply; i++) {
				const color = await contract.methods.colors(i - 1).call()
				this.setState({
          colors: [...this.state.colors, color]
        })
			}
    } else {
      window.alert("SMART CONTRACT NOT DEPLOYED ON THIS NETWORK")
    }
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tokens
          </a>
          <ul className="nabar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-nonw d-sm-block">
              <small className="text-white"><span id="account">{this.state.account}</span></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Issue Token</h1>
                <form onSubmit={(event) => {
                  // dont trigger page change
                  event.preventDefault()
                  const color = this.color.value
                  this.mint(color)
                }}>
                  <input 
                    type='text'
                    className='for,-control mb-1'
                    placeholder='e.g. #FFFFFF'
                    ref={(input) => { this.color = input }}
                  />
                  <input 
                    type='submit' 
                    className='btn btn-block btn-primary' 
                    value='MINT'
                  />
                </form>
              </div>
            </main>
          </div>
          <hr/>
          <div className="row text-center">
            {this.state.colors.map((color, key) => {
                return(
                <div key={key} className="col-md-3 mb-3">
                  <div className="token" style={{ backgroundColor: color}}></div>
                  <div>{color}</div>
                </div>)
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
