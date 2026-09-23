use std::fs;
use std::path::{Path, PathBuf};

fn production_sources(dir: &Path, out: &mut Vec<PathBuf>) {
    for entry in fs::read_dir(dir).unwrap() {
        let path = entry.unwrap().path();
        if path.is_dir() {
            production_sources(&path, out);
        } else if path.extension().is_some_and(|ext| ext == "rs")
            && !path.to_string_lossy().ends_with("_tests.rs")
        {
            out.push(path);
        }
    }
}

#[test]
fn ports_and_extensions_never_import_an_extension() {
    let host = Path::new(env!("CARGO_MANIFEST_DIR")).join("src/host");
    let extensions: Vec<String> = fs::read_dir(host.join("extensions"))
        .unwrap()
        .map(|entry| entry.unwrap().path())
        .filter(|path| path.is_dir())
        .map(|path| path.file_name().unwrap().to_string_lossy().into_owned())
        .collect();
    let cross_layer_paths = ["host::extensions", "super::super"]
        .map(String::from)
        .into_iter()
        .chain(extensions.iter().map(|name| format!("crate::{name}")));
    let grouped_imports_that_hide_paths = ["crate::{", "host::{"].map(String::from);
    let forbidden: Vec<String> = cross_layer_paths
        .chain(grouped_imports_that_hide_paths)
        .collect();

    let mut files = Vec::new();
    production_sources(&host.join("ports"), &mut files);
    for name in &extensions {
        production_sources(&host.join("extensions").join(name), &mut files);
    }
    assert!(files.iter().any(|f| f.ends_with("ports/auth.rs")));

    let violations: Vec<String> = files
        .iter()
        .flat_map(|file| {
            let text: String = fs::read_to_string(file)
                .unwrap()
                .split_whitespace()
                .collect();
            forbidden
                .iter()
                .filter(|needle| text.contains(needle.as_str()))
                .map(|needle| format!("{} uses `{needle}`", file.display()))
                .collect::<Vec<_>>()
        })
        .collect();
    assert_eq!(
        violations,
        Vec::<String>::new(),
        "ports and extensions reach another extension only through a port"
    );
}
