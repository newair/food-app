import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile } from '../api/ingredient.service'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditIngredientProps {
  match: {
    params: {
      ingredientId: string
    }
  },
  location: {
    state: {
      dueDate: string,
    }
  },
  auth: Auth
}

interface EditIngredientState {
  file: any
  uploadState: UploadState
}

export class EditIngredient extends React.PureComponent<
  EditIngredientProps,
  EditIngredientState
  > {
  state: EditIngredientState = {
    file: undefined,
    uploadState: UploadState.NoUpload
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
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)

      console.log(this.props);
      const uploadURLData = {
        contentType: this.state.file.type,
        fileName: this.state.file.name,
        dueDate:this.props.location.state.dueDate,
      };

      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.ingredientId,
      uploadURLData)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file, this.state.file.type)
      
      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Upload new image</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
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
