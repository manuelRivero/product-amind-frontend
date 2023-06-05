import React, { useCallback, useState } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { useDropzone } from 'react-dropzone'
import uploadImage from 'assets/img/upload-cloud.png'
import { Box } from '@material-ui/core'
import TextInput from 'components/TextInput/Index'

const useStyles = makeStyles({
    uploadImage: {
        maxWidth: '100px',
    },
    dropZone: {
        borderRadius: '16px',
        border: 'solid 1px #c2c2c2',
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '150px',
    },
    imagesRow: {
        marginBottom: '2rem',
        display: 'flex',
        gap: '1.5rem',
        '& > img': {
            borderRadius: '16px',
            maxWidth: '166px',
            objectFit: 'cover',
        },
    },
    inputRow: {
        margin: '1rem 0',
        display: 'flex',
        gap: '2rem'
    },
    buttonsRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '1rem',
    },
})

export default function AddProducts() {
    const classes = useStyles()
    const [files, setFiles] = useState([])

    const onDrop = useCallback((acceptedFiles) => {
        // Do something with the files
        acceptedFiles.forEach((e) => {
            setFiles([
                ...files,
                {
                    e,
                    preview: URL.createObjectURL(e),
                },
            ])
        })
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'image/*': [],
        },
    })
    return (
        <section>
            <Box>
                <p>Imágenes de tu producto</p>
            </Box>
            <div className={classes.imagesRow}>
                {files &&
                    files.map((file, index) => {
                        return (
                            <img
                                key={`file-${index}`}
                                src={file.preview}
                                alt="product-image"
                            />
                        )
                    })}
                <div {...getRootProps()} className={classes.dropZone}>
                    <img
                        src={uploadImage}
                        alt="Subir archivo"
                        className={classes.uploadImage}
                    />
                    <input {...getInputProps()} />

                    {isDragActive ? (
                        <p>Suelta tu archivo aquí</p>
                    ) : (
                        <p>
                            Arrastra tu archivo o has click para seleccionar
                            desde tu ordenador
                        </p>
                    )}
                </div>
            </div>
            <Box>
                <p>Información de tu producto</p>
            </Box>
            <Box className={classes.inputRow}>
                <TextInput
                    error={false}
                    icon={null}
                    label={'Nombre del producto'}
                    value={''}
                    onChange={() => {}}
                />
                <TextInput
                    error={false}
                    icon={null}
                    label={'Stock del producto'}
                    value={''}
                    onChange={() => {}}
                />
            </Box>
        </section>
    )
}
