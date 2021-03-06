import * as React from 'react'
import { Form, Button, Header, Modal, Image, Input, InputOnChangeData } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, createIngredient, patchIngredient } from '../api/ingredient.service'
import { ChangeEvent } from 'react'
import { Ingredient } from '../types/Ingredient'

enum UploadState {
    NoUpload,
    FetchingPresignedUrl,
    UploadingFile,
}

interface CreateIngredientProps {
    auth: Auth
    open: boolean
    editIngredient: Ingredient,
    oncloseModal: Function,
}

interface CreateIngredientState {
    name: string,
    file: any,
    uploadState: UploadState,
    open: boolean,
    attachmentUrl?: string,
}

export class CreateIngredient extends React.PureComponent<
    CreateIngredientProps,
    CreateIngredientState
    > {
    state: CreateIngredientState = {
        name: '',
        file: undefined,
        uploadState: UploadState.NoUpload,
        open: this.props.open,
        attachmentUrl: this.props.editIngredient.attachmentUrl,
    }

    constructor(props: CreateIngredientProps) {
        super(props);
        this.setState({
            name: '',
            file: undefined,
            uploadState: UploadState.NoUpload,
            open: this.props.open,
            attachmentUrl: this.props.editIngredient.attachmentUrl,
        })
    }

    componentDidUpdate(prevProps: CreateIngredientProps) {

        if (prevProps.open !== this.props.open) {
            this.setState({
                open: this.props.open,
                name: this.props.editIngredient.name,
                attachmentUrl: this.props.editIngredient.attachmentUrl,
            });

        }
    }

    handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return

        this.setState({
            file: files[0]
        })
    }

    handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault()

        try {
            let newIngredient;
            if(this.props.editIngredient.itemId) {
                newIngredient = await patchIngredient(this.props.auth.getIdToken(), this.props.editIngredient.itemId, {
                    name: this.state.name
                }); 
            } else {
                newIngredient = await createIngredient(this.props.auth.getIdToken(), {
                    name: this.state.name
                });

                if (!this.state.file) {
                    alert('File should be selected')
                    return
                }
            }

            this.setUploadState(UploadState.FetchingPresignedUrl)
    
                console.log(this.props);
                const uploadURLData = {
                    contentType: this.state.file.type,
                    fileName: this.state.file.name,
                };
    
                console.log(this.state);
    
                const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), newIngredient.itemId ||this.props.editIngredient.itemId, uploadURLData)
    
                this.setUploadState(UploadState.UploadingFile)
                await uploadFile(uploadUrl, this.state.file, this.state.file.type)
                this.props.oncloseModal()
                this.setState({
                    open: false
                })

            alert('File was uploaded!')
        } catch (e) {
            alert('Could not upload a file: ' + e.message)
        } finally {
            this.setUploadState(UploadState.NoUpload)
        }
    }

    setUploadState(uploadState: UploadState) {
        this.setState({
            ...this.state,
            uploadState
        })
    }

    onClose() {
        this.state.open = false
    }

    onOpen() {
        this.state.open = true
    }

    closeModal = (event: React.SyntheticEvent) => {
        event.preventDefault()
        this.props.oncloseModal()
        this.setState({open:false})
    }

    handleChange = (e: ChangeEvent<HTMLInputElement>, val: InputOnChangeData) => this.setState({ name: val.value })

    render() {
        return (

            <Modal
                onClose={() => this.onClose()}
                onOpen={() => this.onOpen()}
                open={this.state.open}
            >
                <Modal.Header>Select a Photo</Modal.Header>
                <Modal.Content image>
                    <Image size='medium' src={this.state.attachmentUrl ? this.state.attachmentUrl : 'https://react.semantic-ui.com/images/avatar/large/rachel.png'} wrapped />
                    <Modal.Description>
                        <Header> Ingredient Image</Header>
                        <Form onSubmit={this.handleSubmit}>

                            <Form.Field>
                                <label>Name</label>
                                <Input
                                    type="text"
                                    placeholder="Ingredient Name"
                                    onChange={this.handleChange}
                                    value={this.state.name}
                                />
                            </Form.Field>

                            <Form.Field>
                                <label>File</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    placeholder="Image to upload"
                                    onChange={this.handleFileChange}
                                />
                            </Form.Field>

                            <Form.Field>
                                <Button type='submit'>Submit</Button>
                            </Form.Field>

                            <Button color='black' onClick={this.closeModal}>Nope</Button>
                        </Form>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>

                </Modal.Actions>
            </Modal>

        )
    }

    renderButton() {

        return (
            <div>
                {this.state.uploadState === UploadState.UploadingFile && <p>Creating Ingredient</p>}
                <Button
                    loading={this.state.uploadState !== UploadState.NoUpload}
                    type="submit"
                >
                    Upload
                </Button>
                
            </div>

            
        )
    }
}
