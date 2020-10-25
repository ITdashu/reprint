<?php

class test
{
    public function initTransferFile()
    {
        $content = file_get_contents(__DIR__ . '/en/messages.json');
        $content = json_decode($content, true);
        $output = [];
        foreach ($content as $item) {
            $output[] = $item['message'];
        }

        file_put_contents(__DIR__ . '/local.txt', implode("\n", $output));
    }

    public function render()
    {
        $info = [
            'zh-CN'
        ];
        $baseInfo = json_decode(file_get_contents(__DIR__ . '/base.json'), true);
        foreach ($info as $lang) {
            $output = [];
            $langTransfer = explode("\n", file_get_contents(__DIR__ . '/' . $lang . '/t.txt'));
            $i = 0;
            foreach ($baseInfo as $name => $value) {
                $value['message'] = $langTransfer[$i];
                $output[$name] = $value;
                $i++;
            }
            file_put_contents(__DIR__ . '/' . $lang . '/messages.json', json_encode($output,JSON_UNESCAPED_UNICODE));
        }
    }
}

$test = new test();
$test->render();