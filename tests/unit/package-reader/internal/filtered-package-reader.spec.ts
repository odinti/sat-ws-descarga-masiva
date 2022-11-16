import { realpathSync, unlinkSync, writeFileSync } from 'fs';
import JSZip from 'jszip';
import { OpenZipFileException } from '~/package-reader/exceptions/open-zip-file-exception';
import { FilteredPackageReader } from '~/package-reader/internal/filtered-package-reader';
import { TestCase } from '../../../test-case';
import os from 'os';
import { join } from 'path/posix';
import { randomUUID } from 'crypto';
import { NullFileFilter } from '~/package-reader/internal/file-filters/null-file-filter';
describe('filtered package reader', () => {
    test('create from file with invalid file', async () => {
        const filename = __dirname;
        await expect(FilteredPackageReader.createFromFile(filename)).rejects.toBeInstanceOf(OpenZipFileException);
    });
    test('create from empty zip', async () => {
        const filename = TestCase.filePath('zip/empty.zip');
        await expect(FilteredPackageReader.createFromFile(filename)).rejects.toBeInstanceOf(OpenZipFileException);
    });

    test('create from content with invalid content', async () => {
        await expect(FilteredPackageReader.createFromContents('invalid content')).rejects.toBeInstanceOf(
            OpenZipFileException
        );
    });

    test('file contents and count with file', async () => {
        const zip = new JSZip();
        const tmpdir = realpathSync(os.tmpdir());
        const tmpfile = join(tmpdir, `${randomUUID()}.zip`);
        // create temp file
        writeFileSync(tmpfile, '');
        zip.folder('empty dir');
        zip.file('empty file.txt', '', { binary: true });
        zip.file('foo.txt', 'foo', { binary: true });
        zip.file('sub/bar.txt', 'bar', { binary: true });
        const data = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE'
        });
        writeFileSync(tmpfile, data);
        // zip excludes "empty dir/""
        const expected = new Map([
            ['empty file.txt', ''],
            ['foo.txt', 'foo'],
            ['sub/bar.txt', 'bar']
        ]);
        const packageReader = await FilteredPackageReader.createFromFile(tmpfile);
        packageReader.setFilter(new NullFileFilter());
        const result = new Map();
        for await (const iterator of packageReader.fileContents()) {
            for (const item of iterator) {
                result.set(...item);
            }
        }

        expect(result).toStrictEqual(expected);
        // zip excludes "empty dir/""
        expect(3).toBe(await packageReader.count());
        unlinkSync(tmpfile);
        packageReader.destruct();
    });
});
