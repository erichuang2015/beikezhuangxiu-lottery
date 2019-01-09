import React, { Component } from 'react'
import './App.css'
import member from './member'
import { Select, Button, Icon, message } from 'antd'
import moment from 'moment'
const { Option } = Select

class App extends Component {
  state={
    reward:'',
    person:0,
    rewardArray:[],
    showList:false,
    showLucky:false,
    showButton:true
  }
  
  componentDidMount = () => {
    try {
      window.TagCanvas.Start('myCanvas','',{
        dragControl: 1,
        noMouse:true,
        textHeight: 14,
        initial:[0.2,-0.1],
        reverse: true,
        depth: 0.8,
        maxSpeed: 0.05
      })
    } catch(e) {
      // something went wrong, hide the canvas container
      // document.getElementById('myCanvasContainer').style.display = 'none';
      console.log('error',e)
    }
  }

  handleRewardChange = (value) => {
    console.log(`selected ${value}`)
    if(value === '其他')value=''
    this.setState({
      reward:value
    })
  }

  handlePersonChange = (value) => {
    console.log(`selected ${value}`)
    this.setState({
      person:value
    })
  }

  //加快转速
  start = () => {
    //如果抽奖人数大于存在人数，不允许抽奖
    if(member.length < this.state.person){
      message.warning('人数不够再抽奖啦！')
      this.setState({
        showButton:true
        })
      window.TagCanvas.SetSpeed('myCanvas', [0.2, -0.1])
      return
    }
    //未选择抽奖人数，不允许抽奖
    if(this.state.person === 0){
      message.warning('请选择抽奖人数！')
      return
    }
    this.setState({
      showButton:false
    })
    let speed = 0.9
    window.TagCanvas.SetSpeed('myCanvas', [2,speed])
    window.interval = setInterval(()=>{
      if(speed > 0)speed = -Math.random()
      else speed = Math.random()
      window.TagCanvas.SetSpeed('myCanvas', [speed*7,speed])
    },1000)
  }

  //使转速正常，抽取中奖人员放入数组，显示本轮中奖名单
  stop = () => {
    //公平抽奖的逻辑方法lottery：从member.length人中随机抽person人
    let luckyDog = this.lottery(member, this.state.person) //返回中奖人员数组
    let thisTurnToShow = {
      reward: this.state.reward || this.state.rewardArray.length+1,
      time: moment().format('lll'),
      person:luckyDog
    }
    this.state.rewardArray.push(thisTurnToShow)
    this.setState({
      showButton:true,
      showLucky:true
    })
    clearInterval(window.interval)
    window.TagCanvas.SetSpeed('myCanvas', [0.2, -0.1])
  }

  closeLucky = () => {
    window.TagCanvas.Reload('myCanvas')
    this.setState({
      showLucky:false
    })
  }

  //显示所有中奖名单
  showList = () => {
    if(this.state.rewardArray.length === 0){
      message.warning('请先点击开始进行抽奖！')
      return
    }
    this.setState({
      showList:true
    })
  }

  //从一个数组里随机选n个人，返回人员数组，并把那n个人从原数组中去除
  lottery = (array, n) => {
    let returnArray = []
    while(n > 0){
      let randomNum = Math.floor(Math.random()*array.length)
      returnArray.push(array[randomNum])
      array.splice(randomNum,1)
      n = n - 1
    }
    return returnArray
  }

  render () {
    return (
      <div className='App'>
        <div className="header">
          <img src={require('./img/beike.jpg')} className='head-img' alt=""/>
          <h1 className='head-title'>贝壳装修抽奖系统</h1>
        </div>
        <div id="myCanvasContainer">
          <canvas width="800" height="800" id="myCanvas">
            <p>Anything in here will be replaced on browsers that support the canvas element</p>
            <ul>
              {member.map((val,idx)=>{
                  return (
                    <li key={idx}><a href="/no-use-href"><img src={require(`${val.img}`)} alt="" width="50" height="50"/></a></li>
                  )
                })}
            </ul>
          </canvas>
        </div>
        <div className="footer">
          <div className="foot-left inline-block">
            <Select defaultValue="奖项" className='select-style' onChange={this.handleRewardChange}>
              <Option value="一等奖">一等奖</Option>
              <Option value="二等奖">二等奖</Option>
              <Option value="三等奖">三等奖</Option>
              <Option value="其他">其他</Option>
            </Select>
            <Select defaultValue="人数" className='select-style' onChange={this.handlePersonChange}>
              <Option value="1">1人</Option>
              <Option value="2">2人</Option>
              <Option value="3">3人</Option>
              <Option value="4">4人</Option>
              <Option value="5">5人</Option>
            </Select>
          </div>
          <div className="foot-right inline-block">
            {this.state.showButton && <Button className='block' onClick={this.start}>开始</Button>}
            {!this.state.showButton && <Button className='block' onClick={this.stop}>停止</Button>}
            <Button className='block' onClick={this.showList}>中奖名单</Button>
          </div>
          
        </div> 
        {/* 本轮中奖名单弹层 */}
        {this.state.showLucky && (
          <div className="contain-wrap">
            <Icon type='close' className="delete" onClick={this.closeLucky}></Icon>
            <div className="wrap"></div>
            <div className="lucky-title-word">中奖啦！！！</div>
            <div className="lucky">
              {this.state.rewardArray[this.state.rewardArray.length-1].person.map((val,idx)=>{
                return (
                  <div key={idx} className='lucky-item'>
                    <img src={require(`${val.img}`)} className='lucky-item-img' alt="" width="100" height="100"/>
                    <p className='lucky-word'>{val.name}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {/* 所有中奖人员名单弹层 */}
        {this.state.showList && (
          <div className="contain-wrap">
            <Icon type='close' className="delete" onClick={()=>this.setState({showList:false})}></Icon>
            <div className="wrap"></div>
            <div className="list">
              {this.state.rewardArray.map((val,idx)=>{
                return (
                  <div key={idx} className="list-item">
                    <p className="list-title-word">{val.reward}、{val.time.toString()}</p>
                    <div className="list-wrap">
                      {val.person.map((value,index)=>{
                        return (
                          <div key={index} className='list-person-item'>
                            <img src={require(`${value.img}`)} className='list-item-img' alt="" width="100" height="100"/>
                            <p className='list-person-word'>{value.name}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default App
