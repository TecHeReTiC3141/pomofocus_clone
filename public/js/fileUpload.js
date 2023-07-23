FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode ,
)

FilePond.setOptions({
    stylePanelAspectRatio: 1,
    imageResizeTargetWidth: 200,
    imageResizeTargetHeight: 200,
})

FilePond.parse(document.body);