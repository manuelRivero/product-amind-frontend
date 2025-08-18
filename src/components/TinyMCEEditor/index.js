import React from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { makeStyles } from '@material-ui/core/styles'
import { Box, Typography } from '@material-ui/core'
import PropTypes from 'prop-types'

const useStyles = makeStyles({
    container: {
        '& .tox-tinymce': {
            border: '1px solid #ccc',
            borderRadius: '4px',
        },
        '& .tox .tox-statusbar': {
            borderTop: '1px solid #ccc',
        },
    },
    error: {
        border: '1px solid #f44336 !important',
        '& .tox-tinymce': {
            border: '1px solid #f44336 !important',
        },
    },
    label: {
        marginBottom: '8px',
        fontWeight: 500,
        color: '#666',
    },
    labelError: {
        color: '#f44336',
    },
    errorText: {
        display: 'block',
        marginTop: '8px',
        fontSize: '12px',
        color: '#f44336',
    },
})

const TinyMCEEditor = ({
    value = '',
    onChange,
    label = 'Editor de texto',
    error = false,
    errorMessage = '',
    height = 300,
    placeholder = 'Escribe aquí...',
    apiKey = 'your-api-key-here', // Cambiar por tu API key de TinyMCE
}) => {
    const classes = useStyles()

    const defaultConfig = {
        height,
        menubar: false,
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        language: 'es',
        branding: false,
        elementpath: false,
        resize: false,
        placeholder,
        setup: (editor) => {
            editor.on('init', () => {
                if (placeholder) {
                    editor.getBody().setAttribute('data-placeholder', placeholder)
                }
            })
        },
    }

    return (
        <Box>
            <Typography 
                variant="body2" 
                className={`${classes.label} ${error ? classes.labelError : ''}`}
            >
                {label}
            </Typography>
            <Box 
                className={`${classes.container} ${error ? classes.error : ''}`}
            >
                <Editor
                    apiKey={apiKey}
                    value={value}
                    onEditorChange={onChange}
                    init={defaultConfig}
                />
            </Box>
            {error && errorMessage && (
                <Typography className={classes.errorText}>
                    {errorMessage}
                </Typography>
            )}
        </Box>
    )
}

TinyMCEEditor.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    error: PropTypes.bool,
    errorMessage: PropTypes.string,
    height: PropTypes.number,
    placeholder: PropTypes.string,
    apiKey: PropTypes.string,
}

export default TinyMCEEditor
