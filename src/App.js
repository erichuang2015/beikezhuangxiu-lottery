import React, { Component } from 'react'
import './App.css'
import member from './member'
import { Select, Button, Icon, message } from 'antd'
import moment from 'moment'
const { Option } = Select

// 奖项reward暂时不使用，如果要用，将render里的Select注释去掉即可设置奖项

class App extends Component {
  state={
    // reward: '',
    person: 1,
    tmpArray: [],
    showList: false,
    showLucky: false,
    showButton: true
  }

  componentWillMount () {
    member.forEach((val) => {
      val.atScene = true
    })
    // 再次刷新页面时，删除中奖者
    if (localStorage.getItem('rewardArray')) {
      let array = JSON.parse(localStorage.getItem('rewardArray'))
      array.forEach((value) => {
        value.person.forEach((val) => {
          let indexInMember = member.findIndex((v) => {
            return val.name === v.name
          })
          if (indexInMember >= 0) {
            member.splice(indexInMember, 1)
          }
        })
      })
    }
  }

  componentDidMount = () => {
    console.log(member)
    try {
      window.TagCanvas.Start('myCanvas', '', {
        imageRadius: 50,
        imageScale: 1.3,
        dragControl: 1,
        noMouse: true,
        textHeight: 14,
        initial: [0.2, -0.1],
        reverse: true,
        depth: 0.8,
        maxSpeed: 0.05
      })
    } catch (e) {
      // something went wrong, hide the canvas container
      // document.getElementById('myCanvasContainer').style.display = 'none';
      console.log('error', e)
    }
  }

  // handleRewardChange = (value) => {
  //   console.log(`selected ${value}`)
  //   if (value === '其他')value = ''
  //   this.setState({
  //     reward: value
  //   })
  // }

  handlePersonChange = (value) => {
    this.setState({
      person: value
    })
  }

  // 加快转速
  start = () => {
    // 如果抽奖人数大于存在人数，不允许抽奖
    if (member.length < this.state.person) {
      message.warning('人数不够再抽奖啦！')
      this.setState({
        showButton: true
      })
      window.TagCanvas.SetSpeed('myCanvas', [0.2, -0.1])
      return
    }
    // 未选择抽奖人数，不允许抽奖
    if (this.state.person === 0) {
      message.warning('请选择抽奖人数！')
      return
    }
    this.setState({
      showButton: false
    })
    let speed = Math.random()
    window.TagCanvas.SetSpeed('myCanvas', [speed + 2, speed])
    window.interval = setInterval(() => {
      speed = Math.random()
      window.TagCanvas.SetSpeed('myCanvas', [speed + 2, speed])
    }, 1000)
  }

  // 使转速正常，抽取中奖人员放入数组，显示本轮中奖名单
  stop = () => {
    // 公平抽奖的逻辑方法lottery：从member.length人中随机抽person人
    let luckyDog = this.lottery(member, this.state.person) // 返回中奖人员数组
    let thisTurnToShow = {
      reward: localStorage.getItem('rewardArray') ? JSON.parse(localStorage.getItem('rewardArray')).length + 1 : 1,
      time: moment().format('lll'),
      person: luckyDog
    }
    this.state.tmpArray.push(thisTurnToShow)
    if (localStorage.getItem('rewardArray')) {
      let array = JSON.parse(localStorage.getItem('rewardArray'))
      array.push(thisTurnToShow)
      localStorage.setItem('rewardArray', JSON.stringify(array))
    } else {
      localStorage.setItem('rewardArray', JSON.stringify(this.state.tmpArray))
    }
    this.setState({
      showButton: true,
      showLucky: true
    })
    clearInterval(window.interval)
    window.TagCanvas.SetSpeed('myCanvas', [0.2, -0.1])
  }

  closeLucky = () => {
    window.TagCanvas.Reload('myCanvas')
    this.setState({
      showLucky: false
    })
  }

  // 显示所有中奖名单
  showList = () => {
    if (!localStorage.getItem('rewardArray')) {
      message.warning('请先点击开始进行抽奖！')
      return
    }
    this.setState({
      showList: true
    })
  }

  // 从一个数组里随机选n个人，返回人员数组，并把那n个人从原数组中去除
  lottery = (array, n) => {
    let returnArray = []
    while (n > 0) {
      let randomNum = Math.floor(Math.random() * array.length)
      returnArray.push(array[randomNum])
      array.splice(randomNum, 1)
      n = n - 1
    }
    return returnArray
  }

  clearLocalStorage=() => {
    localStorage.removeItem('rewardArray')
    window.location.reload()
  }

  // 是否在现场，如果不在，使这个对象在localstorage里的atScene字段置为非
  ifAvailable (val) {
    let array = JSON.parse(localStorage.getItem('rewardArray'))
    // 找出array里的val并将它的atScene字段置为非
    array.forEach((val1) => {
      val1.person.forEach((val2) => {
        if (val2.name === val.name) {
          val2.atScene = !val2.atScene
        }
      })
    })
    localStorage.setItem('rewardArray', JSON.stringify(array))
    this.forceUpdate()
  }

  render () {
    return (
      <div className='App'>
        <div className='header'>
          <img src={require('./img/beike.jpg')} className='head-img' alt='' />
          <h1 className='head-title'>贝壳装修抽奖系统</h1>
        </div>
        <div id='myCanvasContainer'>
          <canvas width='800' height='800' id='myCanvas'>
            <p>Anything in here will be replaced on browsers that support the canvas element</p>
            <ul>
              {member.map((val, idx) => {
                return (
                  <li key={idx}><a href='/no-use-href'><img src={require(`${val.img}`)} alt='' width='50' height='50' /></a></li>
                )
              })}
            </ul>
          </canvas>
        </div>
        <div className='footer'>
          <div className='foot-left inline-block'>
            {/* <Select defaultValue="奖项" className='select-style' onChange={this.handleRewardChange}>
              <Option value="一等奖">一等奖</Option>
              <Option value="二等奖">二等奖</Option>
              <Option value="三等奖">三等奖</Option>
              <Option value="其他">其他</Option>
            </Select> */}
            <Select defaultValue='1人' className='select-style' onChange={this.handlePersonChange}>
              <Option value='1'>1人</Option>
              <Option value='2'>2人</Option>
              <Option value='3'>3人</Option>
              <Option value='4'>4人</Option>
              <Option value='5'>5人</Option>
            </Select>
          </div>
          {this.state.showButton && <Button className='foot-mid inline-block' onClick={this.start} type='primary'>开始</Button>}
          {!this.state.showButton && <Button className='foot-mid inline-block' onClick={this.stop} type='primary'>停止</Button>}
          <Button className='foot-right inline-block' onClick={this.showList}>中奖名单</Button>
        </div>
        {/* 本轮中奖名单弹层 */}
        {this.state.showLucky && (
          <div className='contain-wrap'>
            <Icon type='close' className='delete' onClick={this.closeLucky} />
            <div className='wrap' />
            <div className='lucky-title-word'>中奖人员</div>
            <div className='lucky'>
              {JSON.parse(localStorage.getItem('rewardArray'))[JSON.parse(localStorage.getItem('rewardArray')).length - 1].person.map((val, idx) => {
                return (
                  <div key={idx} className='lucky-item'>
                    <img src={require(`${val.img}`)} className='lucky-item-img' alt='' width='100' height='100' onClick={this.ifAvailable.bind(this, val)} />
                    <p className='lucky-word'>{val.name}</p>
                    {!val.atScene && <p className='delete-line' />}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {/* 所有中奖人员名单弹层 */}
        {this.state.showList && (
          <div className='contain-wrap'>
            <Button className='reset' onClick={this.clearLocalStorage}>重置</Button>
            <Icon type='close' className='delete' onClick={() => this.setState({ showList: false })} />
            <div className='wrap' />
            <div className='list'>
              {localStorage.getItem('rewardArray') && JSON.parse(localStorage.getItem('rewardArray')).map((val, idx) => {
                return (
                  <div key={idx} className='list-item'>
                    <p className='list-title-word'>{val.reward}、{val.time.toString()}</p>
                    <div className='list-wrap'>
                      {val.person.map((value, index) => {
                        return (
                          <div key={index} className='list-person-item'>
                            <img src={require(`${value.img}`)} className='list-item-img' alt='' width='100' height='100' />
                            <p className='list-person-word'>{value.name}</p>
                            {!value.atScene && <p className='delete-line' />}
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
