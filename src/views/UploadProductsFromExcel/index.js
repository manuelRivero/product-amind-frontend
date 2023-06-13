import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import uploadImage from 'assets/img/upload-cloud.png'
import Button from 'components/CustomButtons/Button'

import { makeStyles } from '@material-ui/core/styles'

import { Link } from 'react-router-dom'

//form

import { Box } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { postProductsExcel } from 'store/products'
import { resetExcelErrors } from 'store/products'
import ReactPaginate from 'react-paginate'


import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

const useStyles = makeStyles({
    uploadImage: {
        maxWidth: '200px',
    },
    dropZone: {
        borderRadius: '16px',
        border: 'solid 1px #c2c2c2',
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem',
        flexDirection: 'column',
        alignItems: 'center',
    },
    buttonsRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '1rem',
    },
    successButtonsRow: {
        display: 'flex',
        marginTop: '1rem',
        gap: '1rem',
    },
    errorWrapper: {
        background: '#fff',
        padding: '.5rem',
        borderRadius: '8px',
        marginBottom:'1rem',
        '& > p': {
            margin: 0,
            marginBottom: '5px',
            color: '#d32f2f',
        },
    },
    pagination: {
        display: 'flex',
        margin: 0,
        padding: 0,
        listStyle: 'none',
        gap: '1rem',
        marginTop: '1rem',
        justifyContent: 'center',
        alignItems: 'center',
    },
    page: {
        padding: '.5rem',
        borderRadius: '4px',
        border: 'solid 1px transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '25px',
        height: '25px',
        cursor:'pointer',
        "& > a":{
            color:'#3c4858'

        }
    },
    activePage: {
        border: 'solid 1px #00ACC1 !important',
        "& > a":{
            color:'#00ACC1'

        }
    },
})

export default function UploadProductsFromExcel() {
    //styles
    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { loadingExcel, uploadExcelErrors } = useSelector((state) => state.products)

    //states
    const [file, setFile] = useState(null)
    const [success, setSuccess] = useState(null)
    const [page, setPage] = useState(0)

    const onDrop = useCallback((acceptedFiles) => {
        // Do something with the files
        // const reader = new FileReader();
        // reader.readAsDataURL(event.target.files[0]); // event is from the HTML input
        setFile(acceptedFiles[0])
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
                '.xlsx',
            ],
        },
    })
    //form

    const submit = async () => {
        console.log('file', file)
        const form = new FormData()
        form.append('excel', file)
        try {
            const response = await dispatch(
                postProductsExcel({ access: user.token, form })
            )
            console.log('response', response)
            setSuccess(true)
        } catch (error) {
            setSuccess(false)
        }
    }
    const onCancel = () => {
        setFile(null)
    }
    const handlePageClick = ({ selected }) => {
        setPage(selected)
    }
    const onReset = async ()=>{
        setFile(null);
        setSuccess(null);
        dispatch(resetExcelErrors())
    }
    return (
        <>
            <div>
                <h3>Subida masiva desde excel</h3>
            </div>
            {uploadExcelErrors && (
                <Box>
                    <h4>Los siguientes productos no se hán podido cargar:</h4>
                    {uploadExcelErrors.slice(page, page + 1 * 10).map((error, index) => {
                        return (
                            <Box
                                key={`error-element-${index}`}
                                className={classes.errorWrapper}
                            >
                                <p>
                                    <strong>Error #{index + 1 + page * 10}</strong>
                                </p>
                                <p>
                                    Id del archivo: <strong>{error._id}</strong>
                                </p>
                                <p>
                                    Error relacionado:{' '}
                                    <strong>{error.error}</strong>
                                </p>
                            </Box>
                        )
                    })}
                    
                    <ReactPaginate
                                    forcePage={page}
                                    pageClassName={classes.page}
                                    containerClassName={classes.pagination}
                                    activeClassName={classes.activePage}
                                    breakLabel="..."
                                    nextLabel={
                                        <Button
                                            isLoading={false}
                                            variant="contained"
                                            color="primary"
                                            type="button"
                                            justIcon
                                        >
                                            <ChevronRightIcon />
                                        </Button>
                                    }
                                    onPageChange={(e) => handlePageClick(e)}
                                    pageRangeDisplayed={5}
                                    pageCount={Math.ceil(
                                        uploadExcelErrors.length / 10
                                    )}
                                    previousLabel={
                                        <Button
                                            isLoading={false}
                                            variant="contained"
                                            color="primary"
                                            type="button"
                                            justIcon
                                        >
                                            <ChevronLeftIcon />
                                        </Button>
                                    }
                                    renderOnZeroPageCount={null}
                                />
                </Box>
            )}
            <form>
                {!file & (success === null) ? (
                    <div {...getRootProps()} className={classes.dropZone}>
                        <img
                            src={uploadImage}
                            alt="Subir archivo"
                            className={classes.uploadImage}
                        />
                        <input
                            {...getInputProps()}
                            accept=".csv, application/vnd.ms-excel, text/csv"
                        />

                        {isDragActive ? (
                            <p>Suelta tu archivo aquí</p>
                        ) : (
                            <p>
                                Arrastra tu archivo o has click para seleccionar
                                desde tu ordenador
                            </p>
                        )}
                    </div>
                ) : (
                    success === null && (
                        <div>
                            <p>
                                Todo listo para subir tu archivo :{' '}
                                {`${file.name}`}
                            </p>
                        </div>
                    )
                )}
                {success && (
                    <div>
                        <p>Tu archivo ha sido subido</p>
                        {uploadExcelErrors && (<p>Pero contiene errores, errores : {uploadExcelErrors.length}</p>)}
                        <Box className={classes.successButtonsRow}>
                        {uploadExcelErrors && (
                            <>
                                
                                <Button
                                    isLoading={false}
                                    variant="contained"
                                    color="primary"
                                    type="button"
                                    onClick={onReset}
                                >
                                    Intentar de nuevo
                                </Button>
                            </>
                        )}
                          <Link to="/admin/products">
                                <Button
                                    isLoading={false}
                                    variant="contained"
                                    color="primary"
                                    type="button"
                                    onClick={submit}
                                >
                                    Ir a productos
                                </Button>
                            </Link>
                            <Link to="/dashboard/products/upload-images-from-zip">
                                <Button
                                    isLoading={false}
                                    variant="contained"
                                    color="primary"
                                    type="button"
                                    onClick={submit}
                                >
                                    Subir imágenes
                                </Button>
                            </Link>
                        </Box>
                    </div>
                )}
                {success === false && (
                    <div>
                        <p>Hubo un error en la subida de archivos</p>
                    </div>
                )}
                {file && success === null && (
                    <Box className={classes.buttonsRow}>
                        <Button
                            isLoading={false}
                            variant="contained"
                            color="danger"
                            type="button"
                            onClick={onCancel}
                        >
                            Cancelar
                        </Button>
                        <Button
                            isLoading={loadingExcel}
                            variant="contained"
                            color="primary"
                            type="button"
                            onClick={submit}
                        >
                            Subir
                        </Button>
                    </Box>
                )}
            </form>
        </>
    )
}
