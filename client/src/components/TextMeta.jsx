const TextMeta = ({Text, CreatedAt}) => {
    return(
        <div className="Text-Container">
            <p className="Text">{Text}</p>
            <p className="CreatedAt">{CreatedAt}</p>
        </div>
    )
}

export default TextMeta