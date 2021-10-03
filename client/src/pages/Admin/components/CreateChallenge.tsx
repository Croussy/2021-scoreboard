import styled from '@emotion/styled'
import { Box } from 'components/Box'
import { ImageInput } from 'components/ImageInput'
import { LabelInput } from 'components/LabelInput'
import Popup from 'components/Popup'
import { TextArea, TextInput } from 'components/TextInput'
import { useChallengeForm } from 'hooks/useChallengeForm'
import { Challenge } from 'models/Challenge'
import { Difficulties } from 'models/Difficulty'
import { useRef } from 'react'

export type AdminProps = {
  chall?: Challenge
  onClose: () => void
}

export function CreateChallenge ({ chall, onClose }: AdminProps) {
  const {
    formProps,
    nameProps,
    authorProps,
    categoryProps,
    descriptionProps,
    linkProps,
    difficultyProps,
    imgProps,
    flagsProps,
    error,
    isNewChallenge,
  } = useChallengeForm(chall, onClose)
  const ref = useRef<HTMLFormElement>(null)

  return (
    <Popup
      title={
        isNewChallenge
          ? 'Create a new challenge'
          : `Edition of challenge "${chall?.name}""`
      }
      onCancel={onClose}
      onValidate={() => ref.current?.requestSubmit() && onClose()}
    >
      <Form ref={ref} {...formProps}>
        <LabelInput label="Name" required>
          <TextInput type="text" {...nameProps} />
        </LabelInput>

        <LabelInput label="Author" required>
          <TextInput type="text" {...authorProps} />
        </LabelInput>

        <LabelInput label="Description" required>
          <TextArea rows={6} {...descriptionProps} />
        </LabelInput>

        <LabelInput label="Flag" required>
          <TextInput type="text" {...flagsProps} />
        </LabelInput>

        <LabelInput label="Link">
          <TextInput type="url" {...linkProps} />
        </LabelInput>

        <LabelInput label="Category" required>
          <TextInput type="text" {...categoryProps} />
        </LabelInput>

        <LabelInput label="Difficulty" required>
          <select {...difficultyProps}>
            {Difficulties.map(d => (
              <option value={d}>{d}</option>
            ))}
          </select>
        </LabelInput>

        <LabelInput label="Image" required>
          <ImageInput {...imgProps} />
        </LabelInput>

        {error && (
          <Box backgroundColor="red" color="white">
            {error}
          </Box>
        )}
      </Form>
    </Popup>
  )
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
`
