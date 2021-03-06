import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { deleteFood, getFoods } from '../api/food.service'
import Auth from '../auth/Auth'
import { Food } from '../types/Food'
import { CreateFood } from './CreateFood'

interface FoodProps {
  auth: Auth
  history: History
}

interface FoodState {
  foods: Food[]
  newFoodName: string
  loadingFoods: boolean
  showCreateModal: boolean
  editFood: Food
}

export class Foods extends React.PureComponent<FoodProps, FoodState> {
  state: FoodState = {
    foods: [],
    newFoodName: '',
    loadingFoods: true,
    showCreateModal: false,
    editFood: {
      foodId: '',
      itemId: '',
      name: '',
      attachmentUrl: '',
      ingredients: [],
    } ,
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newFoodName: event.target.value })
  }

  onEditButtonClick = (food: Food) => {
    this.setState({
      showCreateModal: true,
      editFood: food,
    })
  }

  handleCreateClick = () => {
    this.setState({
      showCreateModal: true,
    })
  }

  onFoodDelete = async (itemId: string) => {
    try {
      await deleteFood(this.props.auth.getIdToken(), itemId)
      this.setState({
        foods: this.state.foods.filter(food => food.itemId != itemId)
      })
    } catch {
      alert('Food deletion failed')
    } 
  }

  async componentDidMount() {
    try {
      await this.loadFoods()
    } catch (e) {
      alert(`Failed to fetch foods: ${e.message}`)
    }

    this.setState({
      loadingFoods: false
    })
  }

  async loadFoods() {
    const foods = await getFoods(this.props.auth.getIdToken())
    this.setState({
      foods,
    })
  }

  oncloseModal = async () => {
    this.setState({
      showCreateModal: false,
    })
    await this.loadFoods()
  }

  render() {
    return (
      <div>
        <Header as="h1">Foods</Header>
            <CreateFood auth={this.props.auth} open={this.state.showCreateModal} oncloseModal={this.oncloseModal} editFood={this.state.editFood}></CreateFood>
        {this.renderCreateFoodInput()}
        {this.renderFoods()}
      </div>
    )
  }

  renderCreateFoodInput() {
    return (
      <Grid.Row>
        <Grid.Column width={2}>
        <Button
            content='Create Food'
            onClick={this.handleCreateClick}
          />
        </Grid.Column>
        <Grid.Column width={14}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderFoods() {
    if (this.state.loadingFoods) {
      return this.renderLoading()
    }

    return this.renderFoodList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Foods
        </Loader>
      </Grid.Row>
    )
  }

  renderFoodList() {
    return (
      <Grid padded>
        {this.state.foods.map((food, pos) => {
          return (
            <Grid.Row key={food.itemId}>

              <Grid.Column width={10} verticalAlign="middle">
                {food.name}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(food)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onFoodDelete(food.itemId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {food.attachmentUrl && (
                <Image src={food.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
